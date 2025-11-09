# Koa GraphQL DeepSeek API

一个基于 Cloudflare Workers 的 GraphQL API 服务，集成了 DeepSeek AI，使用 Hono 框架构建。

## 功能特性

- 🌍 **边缘计算**：部署在 Cloudflare Workers，全球低延迟访问
- 🚀 **轻量级框架**：使用 Hono 框架，专为边缘运行时优化
- 📊 **GraphQL API**：标准的 GraphQL 接口，易于集成
- 🤖 **DeepSeek AI**：集成 DeepSeek AI API，支持智能对话
- 🔧 **灵活配置**：支持自定义模型参数（温度、最大 token 等）
- ✅ **健康检查**：内置健康检查和状态监控端点
- 🔒 **安全配置**：使用 Cloudflare Secrets 管理敏感信息
- 💰 **免费套餐**：100,000 次请求/天的免费额度

## 技术栈

- **运行时**：[Cloudflare Workers](https://workers.cloudflare.com/)
- **框架**：[Hono](https://hono.dev/)
- **API**：[GraphQL](https://graphql.org/)
- **AI 服务**：[DeepSeek API](https://platform.deepseek.com/)
- **开发工具**：[Wrangler](https://developers.cloudflare.com/workers/wrangler/)

## 快速开始

### 前置要求

- Node.js v20.0.0 或更高版本
- Cloudflare 账户（免费）
- DeepSeek API Key

### 1. 克隆项目

```bash
git clone https://github.com/tangzc111/chat-worker.git
cd chat-worker
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置本地开发环境

创建 `.dev.vars` 文件：

```bash
DEEPSEEK_API_KEY=sk-your-api-key-here
```

获取 DeepSeek API Key：
1. 访问 [DeepSeek 开放平台](https://platform.deepseek.com/)
2. 注册/登录账号
3. 在控制台创建 API Key

### 4. 本地开发

```bash
npm run dev
```

服务器将在 `http://localhost:8787` 启动。

### 5. 部署到 Cloudflare Workers

```bash
# 登录 Cloudflare
npx wrangler login

# 设置生产环境的 API Key
npx wrangler secret put DEEPSEEK_API_KEY

# 部署
npm run deploy
```

详细部署说明请查看 [CLOUDFLARE_DEPLOY.md](./CLOUDFLARE_DEPLOY.md)

## API 端点

### 根路径

**GET** `/`

欢迎页面，返回 API 信息和可用端点。

```json
{
  "message": "Welcome to Koa + GraphQL + DeepSeek API on Cloudflare Workers",
  "endpoints": {
    "graphql": "/graphql",
    "health": "/health"
  }
}
```

### 健康检查

**GET** `/health`

检查服务健康状态。

```json
{
  "status": "ok",
  "timestamp": "2025-01-09T12:00:00.000Z"
}
```

### GraphQL 端点

**POST** `/graphql`

GraphQL API 主端点，支持标准的 GraphQL 查询。

**GET** `/graphql`

支持通过 URL 参数发送 GraphQL 查询（适合浏览器测试）。

## GraphQL API 使用

### 查询示例

#### 1. 简单聊天

```graphql
query {
  chat(message: "你好，请介绍一下你自己") {
    content
    model
    timestamp
    usage {
      promptTokens
      completionTokens
      totalTokens
    }
  }
}
```

#### 2. 带自定义参数的聊天

```graphql
query {
  chatWithOptions(input: {
    message: "用简单的语言解释量子计算"
    model: "deepseek-chat"
    temperature: 0.7
    maxTokens: 1000
    systemPrompt: "你是一个专业的科学教育者，擅长用简单的语言解释复杂概念。"
  }) {
    content
    model
    timestamp
    usage {
      promptTokens
      completionTokens
      totalTokens
    }
  }
}
```

#### 3. 检查 DeepSeek API 状态

```graphql
query {
  deepseekStatus {
    status
    timestamp
  }
}
```

### cURL 示例

```bash
curl -X POST http://localhost:8787/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { chat(message: \"Hello\") { content model timestamp } }"
  }'
```

### JavaScript 客户端示例

```javascript
const query = `
  query {
    chat(message: "你好") {
      content
      model
    }
  }
`;

fetch('https://your-worker.workers.dev/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query }),
})
  .then(res => res.json())
  .then(data => console.log(data));
```

### Python 客户端示例

```python
import requests

query = """
query {
  chat(message: "你好") {
    content
    model
  }
}
"""

response = requests.post(
    'https://your-worker.workers.dev/graphql',
    json={'query': query}
)

print(response.json())
```

## 项目结构

```
chat-worker/
├── src/
│   ├── index.js              # Workers 主入口（Hono 应用）
│   ├── graphql/
│   │   ├── schema.js         # GraphQL Schema 定义
│   │   └── resolvers.js      # GraphQL Resolvers 实现
│   └── services/
│       └── deepseek.js       # DeepSeek API 服务封装
├── wrangler.toml             # Cloudflare Workers 配置文件
├── package.json              # 项目依赖和脚本
├── .dev.vars                 # 本地开发环境变量（不提交到 Git）
├── .gitignore                # Git 忽略文件
├── README.md                 # 项目文档（本文件）
├── README_CN.md              # 中文文档
└── CLOUDFLARE_DEPLOY.md      # 详细部署指南
```

## 配置说明

### wrangler.toml

Cloudflare Workers 配置文件：

```toml
name = "chat-worker"
main = "src/index.js"
compatibility_date = "2024-01-01"

[vars]
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"
PORT = "4000"
NODE_ENV = "production"
```

### 环境变量

#### 本地开发（.dev.vars）

```bash
DEEPSEEK_API_KEY=sk-your-api-key-here
```

#### 生产环境（Cloudflare Secrets）

```bash
npx wrangler secret put DEEPSEEK_API_KEY
```

## 可用脚本

```bash
# 本地开发（Wrangler dev）
npm run dev

# 部署到 Cloudflare Workers
npm run deploy

# 查看生产环境实时日志
npm run tail
```

## GraphQL Schema

完整的 GraphQL Schema 定义：

```graphql
type Query {
  "获取 DeepSeek AI 的回复"
  chat(message: String!): ChatResponse!

  "使用自定义参数获取聊天回复"
  chatWithOptions(input: ChatInput!): ChatResponse!

  "检查 DeepSeek API 健康状态"
  deepseekStatus: StatusResponse!
}

type ChatResponse {
  "AI 生成的回复内容"
  content: String!

  "使用的模型名称"
  model: String!

  "Token 使用信息"
  usage: Usage

  "响应时间戳"
  timestamp: String!
}

type Usage {
  "提示词使用的 Token 数"
  promptTokens: Int!

  "回复使用的 Token 数"
  completionTokens: Int!

  "总共使用的 Token 数"
  totalTokens: Int!
}

type StatusResponse {
  "服务状态"
  status: String!

  "检查时间戳"
  timestamp: String!
}

input ChatInput {
  "发送给 DeepSeek 的消息"
  message: String!

  "使用的模型（默认: deepseek-chat）"
  model: String

  "温度参数，控制随机性（0.0 到 2.0）"
  temperature: Float

  "生成的最大 Token 数"
  maxTokens: Int

  "系统提示词，设置 AI 角色和上下文"
  systemPrompt: String
}
```

## 成本说明

### Cloudflare Workers 免费套餐

- **100,000 次请求/天**
- **无限流量**
- **全球 CDN 分发**
- **免费 SSL 证书**

### 付费套餐

超出免费额度后：
- **$5/月** = 1000 万次请求
- 适合中小型应用

### DeepSeek API 定价

请访问 [DeepSeek 定价页面](https://platform.deepseek.com/pricing) 了解最新定价。

## 部署选项

### Cloudflare Workers（推荐）

- 全球边缘计算节点
- 超低延迟
- 自动扩展
- 免费套餐慷慨

详细说明：[CLOUDFLARE_DEPLOY.md](./CLOUDFLARE_DEPLOY.md)

## 故障排除

### Node.js 版本问题

```bash
# 升级到 Node.js v20
nvm install 20
nvm use 20
```

### 本地开发无法启动

```bash
# 确保 .dev.vars 文件存在
echo "DEEPSEEK_API_KEY=your_key" > .dev.vars

# 检查端口占用
lsof -i :8787
```

### 部署失败

```bash
# 检查登录状态
npx wrangler whoami

# 验证配置
npx wrangler deploy --dry-run
```

### API Key 未生效

```bash
# 确认生产环境 secret
npx wrangler secret list

# 重新设置
npx wrangler secret put DEEPSEEK_API_KEY
```

## 开发说明

### 添加新的 GraphQL 查询

1. 在 `src/graphql/schema.js` 中定义新的查询类型
2. 在 `src/graphql/resolvers.js` 中实现 resolver
3. 如需调用 DeepSeek API，更新 `src/services/deepseek.js`

### 本地测试

```bash
# 启动本地服务器
npm run dev

# 在另一个终端测试
curl http://localhost:8787/health
```

## 相关链接

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Hono 框架文档](https://hono.dev/)
- [GraphQL 官方文档](https://graphql.org/)
- [DeepSeek API 文档](https://platform.deepseek.com/api-docs/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

---

**注意**：请不要将 API Key 提交到代码仓库。使用 `.dev.vars` 文件进行本地开发，使用 Cloudflare Secrets 管理生产环境密钥。
