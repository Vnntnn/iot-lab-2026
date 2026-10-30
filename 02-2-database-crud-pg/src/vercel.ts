import { handle } from "hono/vercel";
import { app } from "./app.js";

const vercelApp = handle(app);

export default vercelApp;
