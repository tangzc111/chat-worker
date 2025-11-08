import Koa from 'koa';
import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import { createHandler } from 'graphql-http/lib/use/koa';
import dotenv from 'dotenv';
import { schema } from './graphql/schema.js';
import { rootValue } from './graphql/resolvers.js';

// Load environment variables
dotenv.config();

const app = new Koa();
const router = new Router();

const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(bodyParser());

// GraphQL endpoint
const graphqlHandler = createHandler({
  schema,
  rootValue,
  context: (req) => ({
    req,
  }),
});

router.all('/graphql', async (ctx) => {
  const [body, init] = await graphqlHandler({
    url: ctx.url,
    method: ctx.method,
    headers: ctx.headers,
    body: () => {
      if (ctx.request.body) {
        return Promise.resolve(JSON.stringify(ctx.request.body));
      }
      return ctx.req;
    },
    raw: ctx.req,
    context: ctx,
  });

  ctx.status = init.status || 200;
  
  if (init.headers) {
    for (const [key, value] of Object.entries(init.headers)) {
      ctx.set(key, value);
    }
  }

  if (body) {
    ctx.body = body;
  }
});

// Health check endpoint
router.get('/health', (ctx) => {
  ctx.body = {
    status: 'ok',
    timestamp: new Date().toISOString(),
  };
});

// Welcome page
router.get('/', (ctx) => {
  ctx.body = {
    message: 'Welcome to Koa + GraphQL + DeepSeek API',
    endpoints: {
      graphql: '/graphql',
      health: '/health',
    },
    documentation: 'Send POST requests to /graphql with GraphQL queries',
  };
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 GraphQL endpoint: http://localhost:${PORT}/graphql`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
});

export default app;
