import app from "./app";
import { startClickFlusher } from "./services/clickBuffer";

const PORT: number = Number(process.env.PORT) || 4000;

app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
    startClickFlusher();
})
