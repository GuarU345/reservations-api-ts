import { Request, Response, NextFunction } from "express";
import { HttpError, ValidationError } from "./error";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof HttpError) {
        return res.status(err.status).json({
            message: err.message
        })
    }

    if (err instanceof ValidationError) {
        return res.status(err.status).json({
            errors: err.errors
        })
    }

    else {
        console.error(err);
        return res.status(500).json({
            message: "Error no controlado"
        })
    }
}