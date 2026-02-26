import express from "express";
import type { Request, Response, Router } from "express";

export const user: Router = express.Router();

user.post("/register", (req: Request, res: Response) => {
    try {
        const username = req.body.username as string;
        //generate a unique 4 digit number to append at the end of the username
        const uniqueId = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
        res.json({ username: `${username}#${uniqueId}` });
    }
    catch (error) {
        return res.status(500).json({ error: "An error occurred while registering the user" });
    }
})

