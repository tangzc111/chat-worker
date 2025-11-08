# Koa + GraphQL + DeepSeek API

一个使用 Koa 框架构建的 GraphQL 服务器,集成了 DeepSeek AI API。客户端可以通过 GraphQL 查询与 DeepSeek AI 进行交互。

## 功能特性

- 🚀 基于 Koa 的轻量级服务器
- 📊 GraphQL API 接口
- 🤖 集成 DeepSeek AI API
- 🔧 支持自定义 AI 参数(温度、最大 token 等)
- ✅ 健康检查端点
- 🔒 环境变量配置

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/tangzc111/koa-graphql-deepseek.git
cd koa-graphql-deepseek
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

编辑 `.env` 文件:

```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
PORT=4000
NODE_ENV=development
```

**获取 DeepSeek API Key:**
1. 访问 [DeepSeek 开放平台](https://platform.deepseek.com/)
2. 注册/登录账号
3. 在控制台创建 API Key

### 4. 启动服务器

开发模式(使用 nodemon 自动重启):
```bash
npm run dev
```

生产模式:
```bash
npm start
```

服务器将在 `http://localhost:4000` 启动。

## API 使用

### GraphQL 端点

**地址**: `http://localhost:4000/graphql`

### 查询示例

#### 1. 简单聊天查询

```graphql
query {
  chat(message: "你好,请介绍一下你自己") {
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

#### 2. 带自定义参数的查询

```graphql
query {
  chatWithOptions(input: {
    message: "用一句话解释量子计算"
    model: "deepseek-chat"
    temperature: 0.7
    maxTokens: 1000
    systemPrompt: "你是一个专业的科学教育者,擅长用简单的语言解释复杂概念。"
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

### 使用 cURL 测试

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { chat(message: \"Hello\") { content model timestamp } }"
  }'
```

## 项目结构

```
koa-graphql-deepseek/
├── src/
│   ├── index.js                 # 应用入口
│   ├── graphql/
│   │   ├── schema.js           # GraphQL Schema 定义
│   │   └── resolvers.js        # GraphQL Resolvers
│   └── services/
│       └── deepseek.js         # DeepSeek API 服务
├── .env.example                # 环境变量示例
├── .gitignore                 # Git 忽略文件
├── package.json               # 项目配置
└── README.md                  # 项目文档
```

## 客户端集成示例

### JavaScript (fetch)

```javascript
const query = `
  query {
    chat(message: "你好") {
      content
      model
    }
  }
`;

fetch('http://localhost:4000/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query }),
})
  .then(res => res.json())
  .then(data => console.log(data));
```

### Python (requests)

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
    'http://localhost:4000/graphql',
    json={'query': query}
)

print(response.json())
```

## 许可证

MIT
