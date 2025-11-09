# Cloudflare Workers 部署指南

这是一个基于 Cloudflare Workers 的 GraphQL API 服务，使用 Hono 框架和 DeepSeek AI。

## 前置要求

1. **Node.js v20.0.0 或更高版本**
   ```bash
   # 检查当前版本
   node --version

   # 如果版本低于 v20，使用 nvm 升级
   nvm install 20
   nvm use 20
   ```

2. **Cloudflare 账户**
   - 访问 https://dash.cloudflare.com/sign-up 注册账户（免费）
   - Workers 免费套餐：100,000 次请求/天

3. **DeepSeek API Key**
   - 访问 [DeepSeek 开放平台](https://platform.deepseek.com/)
   - 注册并创建 API Key

## 部署步骤

### 1. 安装依赖

```bash
npm install
```

### 2. 登录 Cloudflare

```bash
npx wrangler login
```

这会打开浏览器进行授权。

### 3. 配置环境变量

设置 DeepSeek API Key（这是敏感信息，不会被提交到代码库）：

```bash
npx wrangler secret put DEEPSEEK_API_KEY
```

系统会提示你输入 API Key 值。

### 4. 部署到 Cloudflare Workers

```bash
npm run deploy
```

或

```bash
npx wrangler deploy
```

部署成功后，会显示你的 Worker URL，例如：
```
https://chat-worker.<your-subdomain>.workers.dev
```

### 5. 测试部署

```bash
# 测试健康检查
curl https://chat-worker.<your-subdomain>.workers.dev/health

# 测试 GraphQL
curl -X POST https://chat-worker.<your-subdomain>.workers.dev/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ deepseekStatus { status timestamp } }"}'
```

## 本地开发

本地开发和测试：

```bash
# 启动本地开发服务器（需要 Node.js v20+）
npm run dev
```

本地服务器会运行在 `http://localhost:8787`

### 本地环境配置

创建 `.dev.vars` 文件配置本地环境变量：

```bash
DEEPSEEK_API_KEY=your_api_key_here
```

**注意**：`.dev.vars` 仅用于本地开发，不会被提交到 Git。

## 查看实时日志

部署后，查看 Worker 的实时日志：

```bash
npm run tail
```

或

```bash
npx wrangler tail
```

## 可用脚本

- `npm run dev` - 本地开发服务器（Wrangler dev）
- `npm run deploy` - 部署到 Cloudflare Workers
- `npm run tail` - 查看生产环境实时日志

## 项目结构

```
chat-worker/
├── src/
│   ├── index.js              # Workers 主入口（Hono 应用）
│   ├── graphql/
│   │   ├── schema.js         # GraphQL Schema 定义
│   │   └── resolvers.js      # GraphQL Resolvers
│   └── services/
│       └── deepseek.js       # DeepSeek API 服务
├── wrangler.toml             # Cloudflare Workers 配置
├── package.json              # 项目配置
└── .dev.vars                 # 本地环境变量（不提交到 Git）
```

## 技术栈

- **运行时**：Cloudflare Workers（边缘计算）
- **框架**：Hono（专为边缘运行时设计的轻量级框架）
- **API**：GraphQL
- **AI 服务**：DeepSeek API

## GraphQL API 使用

### 可用查询

#### 1. 简单聊天

```graphql
query {
  chat(message: "你好，介绍一下你自己") {
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
    message: "解释量子计算"
    model: "deepseek-chat"
    temperature: 0.7
    maxTokens: 1000
    systemPrompt: "你是一个专业的科学教育者"
  }) {
    content
    model
    usage {
      promptTokens
      completionTokens
      totalTokens
    }
  }
}
```

#### 3. 检查服务状态

```graphql
query {
  deepseekStatus {
    status
    timestamp
  }
}
```

### 使用 cURL 测试

```bash
curl -X POST https://your-worker.workers.dev/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ chat(message: \"Hello\") { content } }"}'
```

## 自定义域名（可选）

1. 在 Cloudflare Dashboard 添加你的域名
2. 在 Workers 设置中绑定自定义域名
3. 或在 `wrangler.toml` 中配置路由

## 故障排除

### Node.js 版本问题
```bash
# 如果遇到版本错误
nvm install 20
nvm use 20
```

### 环境变量未生效
```bash
# 确认已设置 secret
npx wrangler secret list

# 重新设置
npx wrangler secret put DEEPSEEK_API_KEY
```

### 部署失败
```bash
# 检查登录状态
npx wrangler whoami

# 验证配置
npx wrangler deploy --dry-run
```

### 本地开发问题
```bash
# 确保 .dev.vars 文件存在
echo "DEEPSEEK_API_KEY=your_key" > .dev.vars

# 检查端口占用
lsof -i :8787
```

## 成本说明

**免费套餐**：
- 100,000 次请求/天
- 无限流量
- 全球 CDN 分发

**付费套餐**（超出免费额度）：
- $5/月 = 1000 万次请求

## 环境变量

### 生产环境（Secrets）

通过 CLI 设置：
```bash
npx wrangler secret put DEEPSEEK_API_KEY
```

### 本地开发（.dev.vars）

创建 `.dev.vars` 文件：
```bash
DEEPSEEK_API_KEY=sk-your-api-key-here
```

## 相关链接

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Hono 框架文档](https://hono.dev/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [DeepSeek API 文档](https://platform.deepseek.com/api-docs/)
- [GraphQL 官方文档](https://graphql.org/)
