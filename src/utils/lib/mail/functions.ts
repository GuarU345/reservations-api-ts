import nodemailer from 'nodemailer'

export const sendEmail = async (mailOptions: any) => {
    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: parseInt(process.env.MAIL_PORT || "587"),
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    });

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error al enviar el correo:", error);
        throw error
    }
}
