import { NextFunction, Request, Response } from "express";
import { signinSchema, userSchema } from "../schemas/user.schema";
import { authService } from "../services/auth.service";
import { ValidationError } from "../middlewares/error";

const signup = async (req: Request, res: Response, next: NextFunction) => {
    const result = userSchema.safeParse(req.body)

    if (!result.success) {
        throw new ValidationError(result.error)
    }

    const body = result.data

    try {
        const newUser = await authService.signup(body)
        return res.status(201).json(newUser)
    } catch (error) {
        next(error)
    }
}

const signin = async (req: Request, res: Response, next: NextFunction) => {
    const result = signinSchema.safeParse(req.body)

    if (!result.success) {
        throw new ValidationError(result.error)
    }

    const body = result.data

    try {
        const userData = await authService.signin(body)
        return res.status(200).json(userData)
    } catch (error) {
        next(error)
    }
}

export const authController = {
    signup,
    signin
}