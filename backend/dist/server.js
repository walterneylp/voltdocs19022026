import { createApp } from "./app.js";
import { env } from "./config/env.js";
const app = createApp();
app.listen(Number(env.PORT), () => {
    console.log(`API listening on :${env.PORT}`);
});
