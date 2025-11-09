import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { graphql } from 'graphql';
import { schema } from './graphql/schema.js';
import { createResolvers } from './graphql/resolvers.js';

const app = new Hono();

// Enable CORS
app.use('/*', cors());

// Welcome endpoint
app.get('/', (c) => {
  return c.json({
    message: 'Welcome to honos + GraphQL + DeepSeek API on Cloudflare Workers',
    endpoints: {
      graphql: '/graphql',
      health: '/health',
    },
    documentation: 'Send POST requests to /graphql with GraphQL queries',
  });
});

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// GraphQL POST endpoint
app.post('/graphql', async (c) => {
  const body = await c.req.json();
  const { query, variables, operationName } = body;

  if (!query) {
    return c.json({ errors: [{ message: 'Query is required' }] }, 400);
  }

  try {
    const rootValue = createResolvers(c.env);

    const result = await graphql({
      schema,
      source: query,
      rootValue,
      variableValues: variables,
      operationName,
    });

    return c.json(result);
  } catch (error) {
    return c.json({
      errors: [{
        message: error.message,
        stack: c.env.NODE_ENV === 'development' ? error.stack : undefined
      }]
    }, 500);
  }
});

// GraphQL GET endpoint
app.get('/graphql', async (c) => {
  const query = c.req.query('query');
  const variables = c.req.query('variables');
  const operationName = c.req.query('operationName');

  if (!query) {
    return c.json({
      message: 'GraphQL endpoint. Send POST requests with query, variables, and operationName.',
      example: {
        query: '{ deepseekStatus { status timestamp } }',
      }
    }, 400);
  }

  try {
    const rootValue = createResolvers(c.env);

    const result = await graphql({
      schema,
      source: query,
      rootValue,
      variableValues: variables ? JSON.parse(variables) : undefined,
      operationName,
    });

    return c.json(result);
  } catch (error) {
    return c.json({
      errors: [{
        message: error.message,
        stack: c.env.NODE_ENV === 'development' ? error.stack : undefined
      }]
    }, 500);
  }
});

export default app;
