import "./db";
import express, {Application, Request, Response} from "express";
import cors from "cors";
import urlsRouter from "./routes/urls"
import redirectRouter from "./routes/redirect"
import analyticsRoutes from "./routes/analytics";

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json())

// Routes
app.use("/api", urlsRouter)
app.use("/", redirectRouter);
app.use("/api/analytics", analyticsRoutes);

// Health check route
app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({ status: "ok "});
});

export default app;