import argon2 from "argon2"
import { prisma } from "../utils/prisma"
import jwt from "jsonwebtoken"
import { AuthError, InternalServerError, NotFoundError, UnauthorizedError } from "../middlewares/error"

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
            throw new AuthError("La cuenta con ese email ya existe")
        } else if (userExists && userExists.name === name) {
            throw new AuthError("El nombre de usuario ya existe")
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
        if (error instanceof AuthError) {
            throw error
        }
        throw new InternalServerError("Error al tratar de registrarse")
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
            throw new UnauthorizedError("Credenciales invalidas")
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
            },
            include: {
                users: {
                    select: {
                        name: true,
                        email: true,
                        role: true
                    }
                }
            }
        })

        return {
            token: newToken.token,
            user: {
                id: newToken.user_id,
                name: newToken.users.name,
                email: newToken.users.email,
                role: newToken.users.role
            }
        }
    } catch (error) {
        throw error
    }
}

const getUserById = async (userId: string) => {
    const user = await prisma.users.findUnique({
        where: {
            id: userId,
        },
        include: {
            tokens: true
        }
    });

    if (!user) {
        throw new AuthError("Usuario no encontrado");
    }

    return user;
}

const canCreateBusiness = async (userId: string) => {
    const user = await prisma.users.findUnique({
        where: {
            id: userId
        }
    })

    if (!user) {
        throw new NotFoundError("Usuario no encontrado")
    }

    if (user?.role !== "BUSINESS_OWNER") {
        throw new UnauthorizedError("No tienes permisos para crear un negocio")
    } else {
        return true
    }
}

const canCreateReservation = async (userId: string) => {
    const user = await prisma.users.findUnique({
        where: {
            id: userId
        }
    })

    if (!user) {
        throw new NotFoundError("Usuario no encontrado")
    }

    if (user?.role !== "CUSTOMER") {
        throw new UnauthorizedError("No tienes permisos para crear una reservacion")
    } else {
        return true
    }
}

export const userService = {
    signup,
    signin,
    getUserById,
    canCreateBusiness,
    canCreateReservation
}