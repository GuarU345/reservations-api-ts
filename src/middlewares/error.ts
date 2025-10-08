import { ZodError } from "zod";

export class HttpError extends Error {
    status: number;
    message: string;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
        this.message = message;
    }
}

export class ValidationError {
    status: number;
    errors: ZodError['issues'];

    constructor(zodError: ZodError) {
        this.status = 400;

        const errors = zodError.issues.map(error => {
            return {
                ...error,
                message: error.message
            }
        })
        this.errors = errors;
    }
}

export class AuthError extends HttpError {
    constructor(message: string) {
        super(401, message);
    }
}

export class InternalServerError extends HttpError {
    constructor(message: string) {
        super(500, message);
    }
}

export class BadRequestError extends HttpError {
    constructor(message: string) {
        super(400, message);
    }
}

export class NotFoundError extends HttpError {
    constructor(message: string) {
        super(404, message);
    }
}

export class UnauthorizedError extends HttpError {
    constructor(message: string) {
        super(401, message);
    }
}