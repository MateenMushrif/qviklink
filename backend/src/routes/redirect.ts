import { Router, Request, Response } from "express";
import { resolveShortCode } from "../services/shortener";
import { recordClick } from "../services/clickBuffer";

const router = Router();

router.get("/:shortCode" , (req: Request, res: Response) => {
    try {
        const shortCodeParam = req.params.shortCode;

        if (typeof shortCodeParam !== "string") {
            res.status(400).json({ error: "Invalid short code" });
            return;
        }

        const shortCode: string = shortCodeParam;

        const result = resolveShortCode(shortCode);

        // record click (non-blocking)
        recordClick(shortCode);

        // HTTP redirect
        res.redirect(302,result.longUrl)
    } catch(error) {
        if (error instanceof Error){ 
            res.status(404).json({ error: error.message })
            return;
        }

        res.status(500).json({ error: "Unknow error occurred" })
    }
})

export default router;
