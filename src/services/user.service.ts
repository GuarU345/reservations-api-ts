import argon2 from "argon2"
import { prisma } from "../utils/prisma"
import jwt from "jsonwebtoken"

const signup = async (body: any) => {
    const { name, email, password, phone } = body

    try {
        const hashedPassword = await argon2.hash(password)

        const userExists = await prisma.users.findFirst({
            where: {
                OR:
                    [
                        {
                            email
                        },
                        {
                            name
                        }
                    ]
            }
        })

        if (userExists && userExists.email === email) {
            throw new Error("La cuenta con ese email ya existe")
        } else if (userExists && userExists.name === name) {
            throw new Error("El nombre de usuario ya existe")
        }

        const newUser = await prisma.users.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "CUSTOMER",
                phone
            }
        })

        return newUser
    } catch (error) {
        throw new Error("Error al tratar de registrarse")
    }
}

const signin = async (body: any) => {
    const { email, password } = body

    try {
        const isRegister = await prisma.users.findUnique({
            where: {
                email
            },
            include: {
                tokens: true
            }
        })

        if (!isRegister || !(await argon2.verify(isRegister.password, password))) {
            throw new Error("Credenciales invalidas")
        }

        const tokenIds = isRegister.tokens.map(token => token.id)

        if (tokenIds.length > 0) {
            await prisma.tokens.update({
                data: {
                    active: false
                },
                where: {
                    id: tokenIds[0]
                }
            })
        }

        const secretKey = process.env.JWT_SECRET || ""

        const token = jwt.sign(
            { id: isRegister.id, email: isRegister.email, role: isRegister.role },
            secretKey
        )

        const newToken = await prisma.tokens.create({
            data: {
                token: token,
                user_id: isRegister.id,
                expires_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
            }
        })

        return {
            token: newToken.token,
            user_id: newToken.user_id,
        }
    } catch (error) {

    }
}

export const userService = {
    signup,
    signin
}