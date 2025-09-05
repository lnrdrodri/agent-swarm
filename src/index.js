import express from "express";
import cron from "node-cron";
import dotenv from "dotenv";

import router from "./server/routes.js";
import { embedAllPages } from "./utils/embedPages.js";

dotenv.config();
const app = express();
app.use(express.json());

app.use("/api", router);

cron.schedule("0 2 * * 0", () => {
  embedAllPages();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 API rodando em http://localhost:${PORT}`);
});
