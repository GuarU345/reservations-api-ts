export const codeTemplate = (code: number) => {
    return `
        <html>
            <head>
                <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f9f9f9;
                    padding: 20px;
                    color: #333;
                }

                .container {
                    max-width: 500px;
                    margin: 0 auto;
                    background-color: #fff;
                    border-radius: 8px;
                    padding: 30px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    text-align: center;
                }

                h1 {
                    color: #2c3e50;
                }

                .code {
                    font-size: 24px;
                    font-weight: bold;
                    color: #1abc9c;
                    margin: 20px 0;
                }

                .expiration {
                    color: #888;
                    font-size: 14px;
                }
                </style>
            </head>
            <body>
                <div class="container">
                <h1>Tu código de verificación</h1>
                <p>Tu código de verificación es:</p>
                <div class="code">${code}</div>
                <p class="expiration">Este código expira en 5 minutos.</p>
                </div>
            </body>
        </html>
    `;
}