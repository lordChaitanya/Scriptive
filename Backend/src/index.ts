import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => c.text('Hello from Hono + Cloudflare Workers!'));

export default app;
