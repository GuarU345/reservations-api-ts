import argon2 from "argon2"
import { prisma } from "../utils/prisma"
import jwt from "jsonwebtoken"
import { AuthError, ConflictError, InternalServerError, NotFoundError, UnauthorizedError } from "../middlewares/error"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { codeTemplate } from "../utils/lib/mail/templates"
import { sendEmail } from "../utils/lib/mail/functions"

const signup = async (body: any) => {
    const { name, email, password, phone, role } = body

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
                role,
                phone
            }
        })

        return newUser
    } catch (error) {
        if (error instanceof AuthError) {
            throw error
        }

        if (error instanceof PrismaClientKnownRequestError) {
            if (error.code === 'P2002' && String(error?.meta?.target).includes('phone')) {
                throw new ConflictError("El numero de telefono ya esta en uso")
            }
        }

        throw new InternalServerError("Error al tratar de registrarse")
    }
}

const signin = async (body: any) => {
    const { email, password, role } = body

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

        if (isRegister?.role !== role) {
            throw new UnauthorizedError("No tienes permiso para acceder a esta aplicación")
        }

        const userCode = await generateCode(isRegister)
        await sendCodeEmail(userCode.user_email, userCode.code)

        return {
            user: {
                id: isRegister.id,
                email: isRegister.email
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

const logout = async (userId: string) => {
    const user = await getUserById(userId)

    try {
        const activeToken = user.tokens.find(tok => tok.active)

        if (!activeToken) {
            throw new NotFoundError("Sesión no encontrada")
        }

        await prisma.tokens.update({
            where: {
                id: activeToken.id
            },
            data: {
                active: false
            }
        })
    } catch (error) {
        if (error instanceof NotFoundError) {
            throw error
        }
        throw new InternalServerError('Error al tratar de eliminar la sesión')
    }
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

const isActiveToken = async (token: string) => {
    try {
        const tokenActive = await prisma.tokens.findFirst({
            where: {
                token
            }
        })

        if (!tokenActive) return false

        const isValid = tokenActive.active && tokenActive.expires_at > new Date()

        return isValid
    } catch (error) {
        throw new InternalServerError('Error al tratar de consultar la sesión')
    }
}

const generateCode = async (userData: any) => {
    try {
        await prisma.user_codes.updateMany({
            where: {
                AND: [
                    { user_id: userData.id },
                    { active: true }
                ]
            },
            data: {
                active: false
            }
        })

        const code = Math.floor(100000 + Math.random() * 900000)

        await prisma.user_codes.create({
            data: {
                code: await argon2.hash(code.toString()),
                user_id: userData.id,
                expiration_date: new Date(Date.now() + 5 * 60 * 1000),
                active: true
            }
        })

        return {
            user_id: userData.id,
            user_email: userData.email,
            code: code
        }
    } catch (error) {
        throw new InternalServerError("Error al tratar de generar el codigo")
    }
}

const sendCodeEmail = async (email: string, code: number) => {
    const mailOptions = {
        from: process.env.MAIL_FROM,
        to: email,
        subject: "Código de Verificación",
        html: codeTemplate(code),
    };

    await sendEmail(mailOptions)
}

const verifyCode = async (body: any) => {
    const { user_id, code } = body;

    const userCode = await prisma.user_codes.findFirst({
        where: {
            user_id,
            active: true,
        },
    });

    if (!userCode) {
        throw new AuthError("Codigo no encontrado");
    }

    const isValid = await argon2.verify(userCode.code, String(code));

    if (!isValid) {
        throw new AuthError("Codigo invalido");
    }

    const isExpired = new Date() > userCode.expiration_date;

    if (isExpired) {
        throw new AuthError("Codigo expirado");
    }

    await prisma.user_codes.update({
        where: {
            id: userCode.id,
        },
        data: {
            active: false,
        },
    });

    return await generateToken(user_id)
}

const generateToken = async (userId: string) => {
    const user = await getUserById(userId)

    const secretKey = process.env.JWT_SECRET || ""

    const token = jwt.sign(
        { user_id: user.id, email: user.email, role: user.role },
        secretKey,
        { expiresIn: "12h" }
    )

    const result = await prisma.$transaction(async (tx) => {
        await tx.tokens.updateMany({
            where: {
                user_id: user.id,
                active: true
            },
            data: {
                active: false
            }
        })

        const newToken = await tx.tokens.create({
            data: {
                token: token,
                user_id: user.id,
                expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000)
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

        return newToken
    })

    return {
        token: result.token,
        user: {
            id: result.user_id,
            name: result.users.name,
            email: result.users.email,
            role: result.users.role
        }
    }
}

export const authService = {
    signup,
    signin,
    getUserById,
    logout,
    canCreateBusiness,
    canCreateReservation,
    isActiveToken,
    verifyCode
}