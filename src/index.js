import Koa from 'koa';
import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import { graphql } from 'graphql';
import { schema } from './graphql/schema.js';
import { rootValue } from './graphql/resolvers.js';

const app = new Koa();
const router = new Router();

const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(bodyParser());

// GraphQL endpoint
router.post('/graphql', async (ctx) => {
  const { query, variables, operationName } = ctx.request.body;

  if (!query) {
    ctx.status = 400;
    ctx.body = { errors: [{ message: 'Query is required' }] };
    return;
  }

  try {
    const result = await graphql({
      schema,
      source: query,
      rootValue,
      variableValues: variables,
      operationName,
    });

    ctx.body = result;
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      errors: [{
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }]
    };
  }
});

// GraphQL GET endpoint (for simple queries)
router.get('/graphql', async (ctx) => {
  const { query, variables, operationName } = ctx.query;

  if (!query) {
    ctx.status = 400;
    ctx.body = {
      message: 'GraphQL endpoint. Send POST requests with query, variables, and operationName.',
      example: {
        query: '{ deepseekStatus { status timestamp } }',
      }
    };
    return;
  }

  try {
    const result = await graphql({
      schema,
      source: query,
      rootValue,
      variableValues: variables ? JSON.parse(variables) : undefined,
      operationName,
    });

    ctx.body = result;
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      errors: [{
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }]
    };
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
