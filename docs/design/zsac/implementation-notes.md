# ZSAC 产品页：图像到前端

后续更新：已按用户确认的混合方案，用五张透明底高品质渲染素材替换初版主视觉及架构终端的简化 SVG。当前交付、提示词与性能记录见 [透明素材说明](./render-masters/README.md)。下文保留初版设计提取过程供追溯。

范围：`/products/zsac-gateway/` 的首屏、四项优势和系统架构。保留已有产品功能、行业场景、关联产品，以及全站导航与页脚。

## 原图内容

- 手机、无人机、执法记录仪、智能头盔，均集成软密码模块。
- 高安全、低功耗、普遍适配、国密专用算法是系统优势，不把它们分别绑定到某一种终端。
- 多终端连接 ZSAC 接入安全网关，网关执行持续认证与实时管控。
- 后端由接入网关、认证中心、密码机组成，支持集群部署、负载均衡；特点为高效、稳定、易扩展。
- ZSAC 接入安全机制作为共同基础，对应安全、合规、易用、低成本。

## 生成参考与提取

使用 image-to-code-skill 和内置 image_gen，先分别生成两个独立、可阅读的区块参考，再实施。原始附件是内容参考，不是要求直接修改的图片。

- `hero-reference.png`：白底，左侧产品介绍、右侧四终端环绕网关。标题两行，左侧约 42%，右侧约 58%。蓝色主操作与次级架构锚点并列。底部四项优势由细线分隔。标题约 60px，正文 16–18px，宽屏边距约 80px。
- `architecture-reference.png`：三个阶段横向排布，终端选择、中央网关、集群服务。左侧选中态为淡蓝底和蓝色竖线；正交线路汇合到网关。底部是一条安全机制基座和终端说明。标题约 42px，终端名称 16–18px。
- 调色：白色背景、`#1b2738` 主文字、`#2467d6` 强调色、`#607086` 辅助文字、`#f2f7ff` 浅蓝底、`#e0eafa` 连接及分隔线。
- 图形转译为可复用 SVG：四类终端、服务器、等距分层网关与盾牌。图形表达逻辑关系，不模拟真实产品外观或管理后台。
- 四个标志组件：终端环绕主视觉、终端选择行、等距网关、接入安全机制基座。
- 动效：主视觉轻浮动；选中线路虚线流动。沿用现有文字入场、按钮反馈，减少动态效果模式关闭浮动与线路动画。
- 手机布局：首屏上下排布，终端选择为两列，网关和集群纵向阅读；平板先并列终端与网关，集群占下一行。

设计主张：原图中的可信接入链路成为页面的主体构图；访问者通过选择真实终端查看对应接入说明。无脚本时技术关系和默认说明依然可读。

## 生成提示词

方式：内置 image_gen，非 CLI/API；两张图均以用户附件作为内容参考，使用不透明白色背景。提示词核心如下，完整调用可见会话工具记录。

1. **首屏**：Create one large readable desktop website hero section, 1536×1024, for emaplink ZSAC智能准入控制系统. Bright white/slate/royal blue #2467d6. Left 42%: 产品中心 / ZSAC, headline ZSAC智能准入 / 控制系统, subtitle 让每一次接入，都有可信身份。, paragraph 以软密码模块连接多形态终端，通过双向认证实现持续认证与实时管控。, actions 获取产品资料 and 探索系统架构. Right 58%: smartphone, drone, body camera, smart helmet around central layered ZSAC shield gateway, precise blue connections. Bottom four benefits 高安全、低功耗、普遍适配、国密专用算法. Clean CSS/SVG-achievable geometry, generous space, no fake metrics, purple or dark background.
2. **架构**：Create one standalone detailed architecture section, 1536×1024. White, slate #1b2738, blue #2467d6, mistblue #f4f8ff. Heading 从终端到服务，构建可信接入链路。. Three open columns: 01 多形态终端 with four selectable rows and 软密码模块; 02 可信接入 with layered shield gateway and 持续认证 / 实时管控; 03 集群服务 with 集群部署 · 负载均衡, 接入网关、认证中心、密码机 and 高效、稳定、易扩展. Thin orthogonal connectors, active first row, foundation ZSAC 接入安全机制 / 安全 / 合规 / 易用 / 低成本, explanatory 手机接入 line below. Readable Chinese typography, no nested panels or fake dashboards.

## 视觉复核与约束

按用户指定的 image-to-code 方向匹配参考和现有网站。辅助 taste skill 的随机方向、照片数量、禁止细线/编号等风格规则与此技术架构图及既有页面不一致，未据此添加无关照片或改动已确定的页脚；其 lint/inspect 风格门槛并未全数通过。实际检查采用浏览器截图、溢出测量和交互回归，不将风格 lint 结果称为通过。

截图复核修正：移除与全站 body 重叠的导航留白；终端标签提升层级避免基座遮挡；限制架构中央网关尺寸；放大辅助说明文字；架构标题在逗号处分行。最终将标题按完整短语分别执行逐字动画，修复 SplitText 改变原有换行的问题。

主观复核（10 分制）：层级 8.5、内容对应 9、响应式 8.5、交互 8.5。局限：SVG 采用精细线稿与层叠几何，体积光照比生成参考更克制。

验证：Astro 检查无错误/警告；148 页静态构建成功；13 项浏览器回归通过，包括终端选择、键盘操作、减少动态效果与移动端无溢出；1440/768/390 宽度截图已查看。现有首页标题的三处过期测试断言同步到当前“国密”文案。
