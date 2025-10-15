import { Request, Response, NextFunction } from "express";
import { prisma } from "../utils/prisma";
import jwt from "jsonwebtoken";
import { authService } from "../services/auth.service";
import { AuthError } from "./error";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No cabecera" })
    }

    const token = authHeader.replace("Bearer ", "")

    try {
        const tokenExists = await prisma.tokens.findFirst({
            where: {
                token,
                active: true
            }
        })

        if (!tokenExists) {
            throw new AuthError("Token inválido")
        }

        if (tokenExists.expires_at < new Date()) {
            throw new AuthError("Token expirado")
        }

        jwt.verify(token, process.env.JWT_SECRET || "")

        const user = await authService.getUserById(tokenExists.user_id)

        req.user = {
            id: user.id,
            role: user.role
        }

        next()
    } catch (error) {
        next(error)
    }
}   