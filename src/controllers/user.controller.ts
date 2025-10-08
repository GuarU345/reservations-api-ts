import { Request, Response } from "express";
import { signinSchema, userSchema } from "../schemas/user.schema";
import { userService } from "../services/user.service";

const signup = async (req: Request, res: Response) => {
    const result = userSchema.safeParse(req.body)

    if (!result.success) {
        return res.status(422).json({ error: JSON.parse(result.error.message) })
    }

    const body = result.data

    try {
        const newUser = await userService.signup(body)
        return res.status(201).json(newUser)
    } catch (error) {
        return res.status(400).json({ error: (error as Error).message })
    }
}

const signin = async (req: Request, res: Response) => {
    const result = signinSchema.safeParse(req.body)

    if (!result.success) {
        return res.status(422).json({ error: JSON.parse(result.error.message) })
    }

    const body = result.data

    try {
        const userData = await userService.signin(body)
        return res.status(200).json(userData)
    } catch (error) {
        return res.status(400).json({ error: (error as Error).message })
    }
}

export const userController = {
    signup,
    signin
}