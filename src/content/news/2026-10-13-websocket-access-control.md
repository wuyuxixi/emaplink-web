---
title: 你的终端被接管了？WebSocket 越权访问，一个消息就能冒充他人
date: '2026-10-13'
summary: >-
  WebSocket 握手认证只是起点。消息级授权缺失、Origin 验证不足、Token
  失效检查缺陷和会话所有权验证缺失，可能导致冒充身份、越权访问及会话劫持。本文介绍典型场景，并梳理消息授权、租户隔离、输入验证与监控等防御措施。
draft: false
legacyPath: news-details/news-details134.html
---

## 一、漏洞详细介绍

### 1.1 一句话理解这个漏洞

**WebSocket 连接建立后，服务端以为“这个连接已经认证过了”，于是不再检查每一条消息是谁发的、发给谁的、有没有权限——结果攻击者可以冒充他人、越权操作、甚至接管整个终端会话。**

### 1.2 为什么 WebSocket 容易越权？

WebSocket 和普通 HTTP 请求有一个根本区别：

| 对比项 | HTTP | WebSocket |
| --- | --- | --- |
| 通信方式 | 请求-响应，一次一个 | 全双工，长连接，消息持续流动 |
| 认证时机 | 每个请求都可以检查 | **只在握手时检查一次** |
| 授权粒度 | 每个接口单独控制 | 连接建立后，消息路由容易失控 |
| 浏览器安全策略 | 受同源策略和 CORS 保护 | **不受同源策略约束** |

**关键问题**：HTTP 的每一次请求都要带 Cookie 或 Token，服务端每次都能验证“你是谁”。但 WebSocket 握手成功后，连接就建立了，后续所有消息都在这个连接里跑。**如果服务端只在握手时做了认证，握手之后就不再检查消息的权限，越权就发生了。**

### 1.3 漏洞的四种典型触发场景

**场景一：握手认证后，消息级授权缺失（最常见）**

服务端在 WebSocket 握手时验证了 Token，确认了用户身份。但连接建立后，当客户端发送一条消息（比如“向用户 B 发送消息”、“读取用户 B 的终端输出”），服务端**不再检查当前连接的用户是否有权限操作目标资源**。

典型代码逻辑：

```python
# 握手时认证
user = authenticate(token)

# 但消息处理时——
async def on_message(message):
    target_user_id = message["target_user_id"]
    # 直接执行，没有检查 user 是否有权操作 target_user_id
    send_to(target_user_id, message["content"])
```

攻击者只需把 `target_user_id` 改成别人的 ID，就能冒充他人或越权读取数据。

**场景二：Origin 验证缺失导致 CSWSH（跨站 WebSocket 劫持）**

WebSocket 不受同源策略约束，浏览器在发起 WebSocket 握手时会带上 Cookie，但**不会像 CORS 那样自动阻止跨站连接**。如果服务端不验证 `Origin` 头，攻击者可以架设一个恶意网页，诱导已登录的用户访问，该网页就能用用户的 Cookie 建立 WebSocket 连接，劫持用户的会话。

**场景三：Token 永不失效 / 会话恢复不验证所有权**

WebSocket 的 Token 如果验证逻辑有缺陷（比如超时检查被注释掉、或者会话恢复时不验证所有权），攻击者截获一次 Token 后就能**永久**使用，即使账号被禁用、删除或降权。

**场景四：客户端直接传身份标识，服务端不验证**

最危险的一种：客户端在握手时直接传 `userId`、`userName` 等字段，服务端**不查数据库、不验 Token**，直接信任这些值。

```javascript
// 客户端
socket.emit('auth', { userId: '123', userName: 'victim' });

// 服务端 —— 直接信任，没有任何验证
socket.on('auth', (data) => {
  socket.userId = data.userId; // 危险！
});
```

攻击者把 `userId` 改成任意值，就能以任意用户身份操作。

### 1.4 真实漏洞案例

**案例一：JeecgBoot 的 WebSocket 消息路由越权（CVE-2025-10318）**

JeecgBoot 3.8.2 及之前版本中，`/api/system/sendWebSocketMsg` 接口存在严重的授权缺陷。问题根源在于 **WebSocket 消息路由机制中缺少足够的输入验证和授权检查**。攻击者可以构造包含未授权用户标识的恶意请求，**向系统中任意用户账户发送定向 WebSocket 消息**，实现越权通信和潜在的信息窃取。CVSS 评分 9.8（严重）。

**案例二：Taipy 的 CSWSH 通配符 CORS（CVE-2026-85183）**

Taipy 将 Socket.io 服务器配置为 **通配符 CORS 源**（`origin: '*'`）且启用了凭证标志。这意味着**任何网页**都可以与受害者应用建立带凭证的 WebSocket 连接。攻击者可以从任意域名打开 Socket.io 会话，调用状态变量修改和动作回调，**无需任何 CSRF 保护**。CVSS 评分 9.1（严重）。

**案例三：Chainlit 的会话劫持（CVE-2026-56104）**

Chainlit 2.10.1 之前存在会话劫持漏洞：未认证攻击者在 WebSocket 会话恢复时，只需提供一个**有效的 `sessionId`**，就能恢复并**继承已认证用户的会话**，而服务端**不验证会话所有权**。攻击者通过 `restore_existing_session` 路径，直接获得受害者的权限和角色。

**案例四：AVideo 的 WebSocket Token 永不过期（CVE-2026-34362）**

AVideo 的 `verifyTokenSocket()` 函数中，**Token 超时验证逻辑被注释掉了**。虽然 Token 在设计上应该 12 小时后过期，但验证检查根本不执行。这意味着任何被捕获或合法获取的 WebSocket Token 都能提供**永久访问权限**，即使账号被删除、封禁或降权也不例外。CVSS 评分 9.8（严重）。

**案例五：OpenStack Zaqar 的项目标识绑定失败（CVE-2026-107363）**

Zaqar 23.0.1 之前，WebSocket 传输层**没有将后续请求中的项目标识符与 Keystone Token 认证的项目绑定**。一个拥有某个项目有效 Token 的已认证用户，可以**替换另一个项目的 UUID** 来枚举和操作该项目的数据。这是一个典型的**横向越权**——认证通过了，但授权没做好。

### 1.5 危害等级

| 维度 | 说明 |
| --- | --- |
| 危害 | 冒充他人、越权读写终端、会话劫持、横向移动、持续控制 |
| 利用难度 | 低到中——取决于具体缺失的是哪种检查 |
| 影响范围 | 所有使用 WebSocket 做实时通信的系统，尤其是终端管理、远程控制类应用 |
| CVSS | 最高可达 9.8（严重） |
| OWASP 映射 | A01:2021 Broken Access Control / API5:2023 Broken Function Level Authorization |
| CWE 映射 | CWE-1385（WebSocket 缺少 Origin 验证）、CWE-306（关键功能缺少认证）、CWE-863（授权错误） |

## 二、真实环境防御方案

核心思想：**握手认证只是起点，每一条消息都要重新确认“你是谁、你要干什么、你有没有权限”。**

### 第一层：Origin 验证——阻止 CSWSH

**问题**：WebSocket 不受同源策略约束，浏览器会带着 Cookie 发起跨站 WebSocket 连接。如果服务端不检查 `Origin` 头，攻击者的恶意网页就能劫持用户的会话。

**正确做法**：在 WebSocket 握手阶段，**严格验证 `Origin` 头是否在白名单中**。

```python
# Python (websockets 库) 示例
ALLOWED_ORIGINS = ["https://app.example.com", "https://admin.example.com"]

async def handler(websocket):
    origin = websocket.request_headers.get("Origin")
    if not origin or origin not in ALLOWED_ORIGINS:
        await websocket.close(code=1008, reason="Origin not allowed")
        return
    # 继续处理连接
```

**Go (gorilla/websocket) 示例**：

```go
var upgrader = websocket.Upgrader{
    CheckOrigin: func(r *http.Request) bool {
        origin := r.Header.Get("Origin")
        return origin == "https://app.example.com"
    },
}
```

**关键规则**：

-   **默认拒绝**：如果没有 `Origin` 头（非浏览器客户端），根据安全策略决定是否允许。对于面向浏览器的终端，建议**拒绝无 Origin 的请求**。
-   **不要用通配符**：`CheckOrigin: func(r *http.Request) bool { return true }` 是 Taipy 漏洞的根源，**永远不要这样写**。
-   **白名单精确匹配**：不要用 `strings.Contains`，要精确匹配或使用严格的正则。
-   **配合 SameSite Cookie**：将认证 Cookie 设为 `SameSite=Lax` 或 `Strict`，从浏览器层面阻止跨站 Cookie 传输。

**OWASP 明确指出**：验证 `Origin` 头是防御 CSWSH 的首要措施。

### 第二层：握手认证 + 每消息授权——核心防御

**问题**：握手时认证了用户 A，但后续消息可能要求操作用户 B 的资源，服务端却不检查。

**正确做法**：**在每一次消息处理时，重新验证当前连接的身份和权限。**

**架构设计**：

```python
class WebSocketSession:
    def __init__(self, user_id, roles):
        self.user_id = user_id
        self.roles = roles

    async def handle_message(self, message):
        # 1. 重新验证连接身份（Token 可能已过期或被撤销）
        if not await self.validate_token_still_valid():
            await self.close(4401, "Token expired or revoked")
            return

        # 2. 根据消息类型执行授权检查
        action = message.get("action")
        target = message.get("target")

        if action == "send_message":
            # 检查当前用户是否有权向 target 发送消息
            if not await self.can_send_to(target):
                await self.send_error(403, "Forbidden")
                return

        elif action == "read_terminal":
            # 检查当前用户是否有权读取 target 的终端
            if not await self.can_read_terminal(target):
                await self.send_error(403, "Forbidden")
                return

        # 3. 执行操作
        await self.execute(action, message)
```

**关键原则**：

-   **不要信任消息体中的身份标识**（`userId`、`userName`、`targetUserId`），这些必须由服务端根据当前会话推导，而不是从客户端消息中读取。
-   **每条消息都是一次新的授权决策**，不能因为“握手时认证过了”就跳过。
-   **服务端维护会话与资源的绑定关系**，而不是让客户端指定。

**Spring Security 的做法**：Spring Security 4.0+ 支持对 WebSocket 消息进行授权。通过 `@MessageMapping` 配合 `@PreAuthorize`，可以在每条消息上执行角色检查。核心配置是确保 `hasRole('ADMIN')` 这类表达式在消息级别生效，而不是只在握手级别。

### 第三层：Token 设计——短命 + 可撤销

**问题**：WebSocket 连接是长连接，如果 Token 只在握手时验证一次，后续 Token 过期了连接还在，攻击者可以一直用。

**正确做法**：

**1\. 不要在 URL 查询字符串中放 Token**

```text
❌ ws://example.com/ws?token=eyJhbGci...
```

URL 中的 Token 会**泄漏到访问日志、代理日志、CDN 日志**中。推荐使用 **First-message authentication**：客户端在连接建立后，**通过第一条消息发送 Token**，服务端在 `OnAuth` 钩子中验证。

```javascript
// 客户端
const ws = new WebSocket('wss://example.com/ws');
ws.onopen = () => {
  ws.send(JSON.stringify({ type: 'auth', token: jwt }));
};

// 服务端
ws.on('message', (data) => {
  const msg = JSON.parse(data);
  if (msg.type === 'auth') {
    const user = verifyToken(msg.token);
    if (!user) {
      ws.close(4401);
      return;
    }
    ws.user = user;
  }
});
```

**2\. 设置短生命周期 Token**

Token 有效期建议 **5-15 分钟**，配合 Refresh Token 机制。WebSocket 连接建立后，服务端应定期（如每 60 秒）检查当前 Token 是否仍然有效，如果过期则要求客户端重新认证或关闭连接。

**3\. 实现 Token 撤销检查**

如果 Token 被撤销（用户退出、密码修改、管理员禁用），WebSocket 连接必须感知到。方案包括：

-   \*\*定期轮询 Token 状态：\*\*服务端每 N 秒检查一次 Token 是否在黑名单中。

-   \*\*主动推送撤销事件：\*\*当 Token 被撤销时，通过内部消息通道通知 WebSocket 服务，立即关闭相关连接。

-   \*\*JTI 黑名单：\*\*在 Token 中包含 jti，每次消息验证时检查 jti 是否在黑名单中。

\*\*AVideo 的教训：\*\*Token 超时验证被注释掉，导致 Token 永不过期。**验证逻辑必须实际执行，不能只是“设计上存在”。**

### 第四层：会话所有权验证——防止会话劫持

**问题**：Chainlit 的漏洞在于，攻击者提供一个有效的 `sessionId` 就能**恢复并继承**已认证用户的会话，服务端**不验证会话所有权**。

**正确做法**：

```python
async def restore_session(session_id, current_user):
    session = await db.get_session(session_id)

    # ❌ 错误：只检查 session 是否存在
    # if session:
    #     return session

    # ✅ 正确：检查当前用户是否拥有这个 session
    if not session:
        raise SessionNotFound()

    if session.owner_id != current_user.id:
        # 记录安全事件：有人试图恢复他人的会话
        await security_log.warning(
            f"User {current_user.id} attempted to restore "
            f"session owned by {session.owner_id}"
        )
        raise Forbidden("You do not own this session")

    return session
```

**关键规则**：

-   **每个会话必须绑定一个所有者**（`owner_id`）。

-   **恢复会话时必须验证所有权**，不能只验证 `sessionId` 是否有效。

-   **服务端生成会话 ID**，不要让客户端指定或猜测。

-   **使用加密安全的随机数**生成会话 ID，长度足够（至少 128 位）。

### 第五层：项目/租户隔离——防止横向越权

**问题**：Zaqar 的漏洞在于，已认证用户可以用自己项目的 Token，替换另一个项目的 UUID，访问其他项目的数据。

**正确做法**：

```python
class WebSocketHandler:
    async def handle_message(self, message):
        # 从当前连接的认证上下文中获取项目 ID
        authenticated_project = self.session.project_id

        # 从消息中获取客户端声称的项目 ID
        claimed_project = message.get("project_id")

        # ❌ 错误：直接使用 claimed_project
        # ✅ 正确：必须匹配
        if claimed_project != authenticated_project:
            raise Forbidden("Project mismatch")

        # 使用 authenticated_project 执行操作
        await self.process(authenticated_project, message)
```

**关键规则**：

-   **项目/租户 ID 必须来自服务端的认证上下文**，不能从客户端消息中读取。

-   **如果消息中确实需要包含项目 ID**（比如多租户路由），必须验证它与认证上下文一致。

-   **不要信任客户端传来的任何“我是谁”、“我属于哪个组织”的信息**。

### 第六层：消息级输入验证——不要只信任“已认证”用户

**问题**：很多应用对 REST API 的输入验证很严格，但认为 WebSocket 消息“来自已认证用户”，所以不做验证。OWASP 明确指出这是错误的：**WebSocket 消息可以携带 XSS、SQL 注入和其他恶意载荷，必须像 HTTP 请求一样进行输入验证**。

**正确做法**：

```python
from pydantic import BaseModel, validator
import re

class TerminalCommandMessage(BaseModel):
    action: str
    target_id: str
    command: str

    @validator('action')
    def validate_action(cls, v):
        if v not in ["exec", "read", "list"]:
            raise ValueError("Invalid action")
        return v

    @validator('target_id')
    def validate_target_id(cls, v):
        if not re.match(r'^[a-f0-9-]{36}$', v):  # UUID 格式
            raise ValueError("Invalid target ID")
        return v

    @validator('command')
    def validate_command(cls, v):
        # 白名单：只允许安全的命令
        allowed = ["ls", "pwd", "whoami", "date"]
        if v.split()[0] not in allowed:
            raise ValueError("Command not allowed")
        return v
```

**关键规则**：

-   **每个消息都要做 schema 验证**，检查字段类型、长度、格式。

-   **使用白名单**，不要用黑名单。

-   **对命令类消息，限制可执行的命令**，不要让用户自由执行任意 shell 命令。

-   **对输出类消息，进行转义**，防止 XSS（如果终端输出会渲染到浏览器）。

### 第七层：连接与资源限制

**问题**：攻击者可以建立大量 WebSocket 连接，或者发送大量消息，耗尽服务器资源。

**正确做法**：

**1\. 限制总连接数和每用户连接数**

```python
MAX_TOTAL_CONNECTIONS = 10000
MAX_CONNECTIONS_PER_USER = 5

async def on_connect(user_id):
    if await redis.incr("ws:total") > MAX_TOTAL_CONNECTIONS:
        await redis.decr("ws:total")
        raise TooManyConnections()

    user_conns = await redis.incr(f"ws:user:{user_id}")
    if user_conns > MAX_CONNECTIONS_PER_USER:
        await redis.decr(f"ws:user:{user_id}")
        raise TooManyConnections()
```

**2\. 限制消息大小和频率**

OWASP 建议消息大小限制在 **64KB 以内**，并实施速率限制防止消息洪泛。

```python
MAX_MESSAGE_SIZE = 64 * 1024  # 64KB
MAX_MESSAGES_PER_SECOND = 10

async def handle_message(ws, raw):
    if len(raw) > MAX_MESSAGE_SIZE:
        await ws.close(1009, "Message too large")
        return

    if not await rate_limiter.allow(ws.user_id, "ws_msg"):
        await ws.close(1008, "Rate limit exceeded")
        return
```

**3\. 设置空闲超时**

```python
IDLE_TIMEOUT = 300  # 5 分钟无消息则关闭

async def idle_watchdog(ws):
    while True:
        await asyncio.sleep(60)
        if time.time() - ws.last_activity > IDLE_TIMEOUT:
            await ws.close(1000, "Idle timeout")
            break
```

### 第八层：验证与监控

**测试你的防御是否生效**：

```bash
# 1. 测试 Origin 验证
# 从恶意 Origin 发起 WebSocket 连接，应该被拒绝
websocat -H="Origin: https://evil.com" wss://target.com/ws
# 预期：连接被关闭，关闭码 1008

# 2. 测试消息级授权
# 用用户 A 的 Token 连接，尝试操作用户 B 的资源
ws.send('{"action":"read_terminal","target_id":"user_b_terminal"}')
# 预期：返回 403 Forbidden

# 3. 测试 Token 撤销
# 连接后，在另一端撤销 Token，然后发消息
# 预期：连接被关闭，关闭码 4401
```

**监控指标**：

-   **Origin 拒绝率**：如果为 0，可能 Origin 验证没生效。
-   **403 响应率**：消息级授权拒绝的次数。如果为 0，可能授权检查没执行。
-   **Token 撤销后的消息处理数**：应该为 0。如果大于 0，说明撤销检查没生效。
-   **每用户连接数分布**：发现异常高的连接数，可能是攻击。

## 三、一张表总结防御方案

| 层面 | 措施 | 关键点 |
| --- | --- | --- |
| Origin 验证 | 握手时严格检查 `Origin` 头白名单 | 默认拒绝，不用通配符 |
| 握手认证 | 验证 Token，绑定用户身份到连接 | 不要信任客户端传来的身份字段 |
| 每消息授权 | 每条消息重新检查权限 | 不信任消息中的 `targetUserId` |
| Token 设计 | 短命 + 可撤销 + 定期检查 | 不在 URL 中放 Token |
| 会话所有权 | 恢复会话时验证 `owner_id` | 不验证 `sessionId` 是否有效 |
| 项目隔离 | 项目 ID 必须来自认证上下文 | 不信任客户端传来的项目 ID |
| 输入验证 | 每个消息做 schema 验证 | 像 HTTP 一样严格 |
| 资源限制 | 连接数、消息大小、速率限制 | 防止资源耗尽 |
| 监控 | 监控拒绝率、403 率、撤销后消息数 | 验证防御是否生效 |

## 四、最终记忆口诀

**“Origin 要验证，握手只是起点；每条消息查权限，身份不从客户端取；Token 要短命可撤销，会话恢复验所有权；项目隔离不跨租，输入验证不能省。”**

只要记住：**WebSocket 的安全模型和 HTTP 完全不同——HTTP 每次请求都是独立的，WebSocket 是一条持续流动的隧道。在这条隧道里，你必须在每一个路口都设卡检查，而不是只在入口查一次。**
