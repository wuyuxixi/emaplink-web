import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const DIR = path.join(ROOT, 'src', 'content', 'news');

const cleanCodeBlocks = [
  {
    lang: 'python',
    code: `# 握手时认证
user = authenticate(token)

# 但消息处理时——
async def on_message(message):
    target_user_id = message["target_user_id"]
    # 直接执行，没有检查 user 是否有权操作 target_user_id
    send_to(target_user_id, message["content"])`,
  },
  {
    lang: 'javascript',
    code: `// 客户端
socket.emit('auth', { userId: '123', userName: 'victim' });

// 服务端 —— 直接信任，没有任何验证
socket.on('auth', (data) => {
  socket.userId = data.userId; // 危险！
});`,
  },
  {
    lang: 'python',
    code: `# Python (websockets 库) 示例
ALLOWED_ORIGINS = ["https://app.example.com", "https://admin.example.com"]

async def handler(websocket):
    origin = websocket.request_headers.get("Origin")
    if not origin or origin not in ALLOWED_ORIGINS:
        await websocket.close(code=1008, reason="Origin not allowed")
        return
    # 继续处理连接`,
  },
  {
    lang: 'go',
    code: `var upgrader = websocket.Upgrader{
    CheckOrigin: func(r *http.Request) bool {
        origin := r.Header.Get("Origin")
        return origin == "https://app.example.com"
    },
}`,
  },
  {
    lang: 'python',
    code: `class WebSocketSession:
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
        await self.execute(action, message)`,
  },
  {
    lang: 'text',
    code: `❌ ws://example.com/ws?token=eyJhbGci...`,
  },
  {
    lang: 'javascript',
    code: `// 客户端
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
});`,
  },
  {
    lang: 'python',
    code: `async def restore_session(session_id, current_user):
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

    return session`,
  },
  {
    lang: 'python',
    code: `class WebSocketHandler:
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
        await self.process(authenticated_project, message)`,
  },
  {
    lang: 'python',
    code: `from pydantic import BaseModel, validator
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
        return v`,
  },
  {
    lang: 'python',
    code: `MAX_TOTAL_CONNECTIONS = 10000
MAX_CONNECTIONS_PER_USER = 5

async def on_connect(user_id):
    if await redis.incr("ws:total") > MAX_TOTAL_CONNECTIONS:
        await redis.decr("ws:total")
        raise TooManyConnections()

    user_conns = await redis.incr(f"ws:user:{user_id}")
    if user_conns > MAX_CONNECTIONS_PER_USER:
        await redis.decr(f"ws:user:{user_id}")
        raise TooManyConnections()`,
  },
  {
    lang: 'python',
    code: `MAX_MESSAGE_SIZE = 64 * 1024  # 64KB
MAX_MESSAGES_PER_SECOND = 10

async def handle_message(ws, raw):
    if len(raw) > MAX_MESSAGE_SIZE:
        await ws.close(1009, "Message too large")
        return

    if not await rate_limiter.allow(ws.user_id, "ws_msg"):
        await ws.close(1008, "Rate limit exceeded")
        return`,
  },
  {
    lang: 'python',
    code: `IDLE_TIMEOUT = 300  # 5 分钟无消息则关闭

async def idle_watchdog(ws):
    while True:
        await asyncio.sleep(60)
        if time.time() - ws.last_activity > IDLE_TIMEOUT:
            await ws.close(1000, "Idle timeout")
            break`,
  },
  {
    lang: 'bash',
    code: `# 1. 测试 Origin 验证
# 从恶意 Origin 发起 WebSocket 连接，应该被拒绝
websocat -H="Origin: https://evil.com" wss://target.com/ws
# 预期：连接被关闭，关闭码 1008

# 2. 测试消息级授权
# 用用户 A 的 Token 连接，尝试操作用户 B 的资源
ws.send('{"action":"read_terminal","target_id":"user_b_terminal"}')
# 预期：返回 403 Forbidden

# 3. 测试 Token 撤销
# 连接后，在另一端撤销 Token，然后发消息
# 预期：连接被关闭，关闭码 4401`,
  },
];

function stripDisclaimer(markdown) {
  return markdown
    .replace(/^\s*注：内容均来源于互联网.*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trimEnd();
}

function ensureBlankAfterFrontmatter(markdown) {
  return markdown.replace(/^---\n([\s\S]*?)\n---\n(?!\n)/, '---\n$1\n---\n\n');
}

async function fix134() {
  const file = path.join(DIR, '2026-10-13-websocket-access-control.md');
  let markdown = await fs.readFile(file, 'utf8');
  let index = 0;
  markdown = markdown.replace(/```[\s\S]*?```/g, () => {
    const block = cleanCodeBlocks[index];
    if (!block) throw new Error(`Unexpected code block ${index + 1}`);
    index += 1;
    return `\`\`\`${block.lang}\n${block.code}\n\`\`\``;
  });
  if (index !== cleanCodeBlocks.length) {
    throw new Error(`Expected ${cleanCodeBlocks.length} code blocks, found ${index}`);
  }
  markdown = stripDisclaimer(markdown);
  markdown = ensureBlankAfterFrontmatter(markdown);
  await fs.writeFile(file, `${markdown}\n`, 'utf8');
  console.log(`fixed 134: ${index} code blocks`);
}

async function fix133() {
  const file = path.join(DIR, '2026-08-22-crypto-evaluation-rule.md');
  let markdown = await fs.readFile(file, 'utf8');
  markdown = markdown
    .replace('第二十三条：密评第一次被写进数据安全制度', '## 第二十三条：密评第一次被写进数据安全制度')
    .replace('互认条款已删，密评不是免检', '## 互认条款已删，密评不是免检')
    .replace('排期怎么对账', '## 排期怎么对账')
    .replace('速查单，对着打勾', '## 速查单，对着打勾')
    .replace('我们是不是重要数据处理者？', '## 我们是不是重要数据处理者？')
    .replace('⚠️ 不做，会怎样？业务可能被叫停，不是标题党', '## ⚠️ 不做，会怎样？业务可能被叫停，不是标题党')
    .replace(/\n谁被绑住？\n\n谁被绑住？重要数据处理者。/g, '\n## 谁被绑住？\n\n重要数据处理者。');
  markdown = stripDisclaimer(markdown);
  markdown = ensureBlankAfterFrontmatter(markdown);
  await fs.writeFile(file, `${markdown}\n`, 'utf8');
  console.log('fixed 133');
}

async function fix127() {
  const file = path.join(DIR, '2026-05-30-mlps-compliance.md');
  let markdown = await fs.readFile(file, 'utf8');
  markdown = markdown
    .replace('source: 密\n', 'source: 密安护航\n')
    .replace('一、到底改了什么？——和你有关系的四条', '## 一、到底改了什么？——和你有关系的四条')
    .replace('二、"等保+密评"协同监管，到底强制了什么？', '## 二、"等保+密评"协同监管，到底强制了什么？')
    .replace('三、处罚力度有什么变化？', '## 三、处罚力度有什么变化？')
    .replace('四、密码产品厂商可以关注的趋势', '## 四、密码产品厂商可以关注的趋势')
    .replace('五、哪些企业需要关注？——自查参考', '## 五、哪些企业需要关注？——自查参考')
    .replace('六、值得关注的时间节点', '## 六、值得关注的时间节点');
  markdown = stripDisclaimer(markdown);
  markdown = ensureBlankAfterFrontmatter(markdown);
  await fs.writeFile(file, `${markdown}\n`, 'utf8');
  console.log('fixed 127');
}

async function fix128() {
  const file = path.join(DIR, '2026-05-30-password-defines-security.md');
  let markdown = await fs.readFile(file, 'utf8');
  markdown = markdown
    .replace('人物简介： 郑建华,', '## 人物简介\n\n郑建华,')
    .replace(/\n“密码定义安全” 的思考与愿景\n/g, '\n');
  markdown = stripDisclaimer(markdown);
  markdown = ensureBlankAfterFrontmatter(markdown);
  await fs.writeFile(file, `${markdown}\n`, 'utf8');
  console.log('fixed 128');
}

async function fix132() {
  const file = path.join(DIR, '2026-08-18-civil-aviation-crypto-standard.md');
  let markdown = await fs.readFile(file, 'utf8');
  markdown = markdown
    .replace('配图 1)', '配图 1：民航局征求意见稿截图)', 1)
    .replace('配图 2)', '配图 2：民航局征求意见稿截图)', 1)
    .replace('配图 3)', '配图 3：民航局征求意见稿截图)', 1)
    .replace('配图 4)', '配图 4：民航局征求意见稿截图)', 1);
  markdown = stripDisclaimer(markdown);
  markdown = ensureBlankAfterFrontmatter(markdown);
  await fs.writeFile(file, `${markdown}\n`, 'utf8');
  console.log('fixed 132');
}

await fix134();
await fix133();
await fix127();
await fix128();
await fix132();
