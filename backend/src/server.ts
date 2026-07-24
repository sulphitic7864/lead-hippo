import { app } from "./app.js";
import { env } from "./config/env.js";
import { startScheduler } from "./scheduler.js";
const server = app.listen(env.PORT, () => {
  console.log(`Lead Hippo API listening on http://localhost:${env.PORT}`);
  startScheduler();
});
const shutdown = () => server.close(() => process.exit(0));
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
