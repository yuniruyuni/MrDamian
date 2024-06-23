import { copyFile, mkdir } from "node:fs/promises";

await mkdir("static", { recursive: true });
await copyFile("frontend/index.html", "static/index.html");
