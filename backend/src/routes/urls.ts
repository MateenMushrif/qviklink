import { Router, Request, Response } from "express";
import { createShortUrl, deleteShortUrl } from "../services/shortener";

const router = Router();

interface CreateShortUrlBody {
    longUrl: string;
    customAlias?: string;
    expiresAt?: string;
}

// POST Route
router.post("/shorten", (req: Request<{}, {}, CreateShortUrlBody>, res: Response) => {
    try{
        const { longUrl, customAlias, expiresAt } = req.body;

        const result = createShortUrl({
            longUrl,
            customAlias,
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        });

        res.status(201).json(result);
    } catch(error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
            return;
        }
        
        res.status(500).json({ error: "Unkown error occurred" });
    }
});


// Delete Route
router.delete("/:shortCode", (req: Request, res: Response) => {
    try {
        const shortCodeParam = req.params.shortCode;

        if (typeof shortCodeParam !== "string") {
            res.status(400).json({ error: "Invalid short code" });
            return;
        }

        deleteShortUrl(shortCodeParam);

        res.status(204).send();
    } catch (error) {
        if (error instanceof Error) {
            res.status(404).json({ error: error.message });
            return;
        }

        res.status(500).json({ error: "Unknown error occured" });
    }
})

export default router;