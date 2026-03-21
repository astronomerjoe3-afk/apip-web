const fs = require("fs");
const p = "C:/Users/User/OneDrive/Documents/Playground/apip-web/lib/lessonRunnerApi.ts";
let s = fs.readFileSync(p, "utf8");
if (!s.includes("\\r\\n        return")) throw new Error("escaped newline marker not found");
s = s.replace("\\r\\n        return", String.fromCharCode(13, 10) + "        return");
fs.writeFileSync(p, s);
