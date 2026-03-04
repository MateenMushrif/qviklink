import { Router, Request, Response } from "express";
import { getUrlAnalytics } from "../services/analytics";

const router = Router();

router.get("/:shortCode", (req: Request, res: Response) => {
    try {
        const shortCodeParam = req.params.shortCode;

        if (typeof shortCodeParam !== "string") {
            res.status(400).json({ error: "Invalid short code" });
            return;
        }

        const shortCode: string = shortCodeParam;

        const analytics = getUrlAnalytics(shortCode);

        res.status(200).json(analytics);
    } catch (error) {
        console.error("Analytics error:", error);

        res.status(500).json({
            error: "Failed to retrieve analytics",
        });
    }
});

export default router;