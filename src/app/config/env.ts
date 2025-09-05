import 'dotenv/config'


interface EnvConfig {
    PORT: string,
    DB_URL: string,
    BCRYPT_SALT_ROUND: string,

    JWT_ACCESS_SECRET: string,
    JWT_ACCESS_EXPIRES: string,

    SMTP_HOST:string,
    SMTP_PORT:string,
    SMTP_USER: string,
    SMTP_PASSWORD: string,
}

const loadEnvVariables = (): EnvConfig => {
    const requiredEnvVariables: string[] = ["PORT", "DB_URL", "BCRYPT_SALT_ROUND",
        "JWT_ACCESS_SECRET", "JWT_ACCESS_EXPIRES", "SMTP_HOST","SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD"
    ]

    requiredEnvVariables.forEach(key => {
        if (!process.env[key]) {
            throw new Error(`missisng require environment variable ${key}`)
        }
    })

    return {
        PORT: process.env.PORT as string,
        DB_URL: process.env.DB_URL as string,
        BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND as string,

        JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
        JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES as string,

        SMTP_HOST: process.env.SMTP_HOST as string,
        SMTP_PORT: process.env.SMTP_PORT as string,
        SMTP_USER: process.env.SMTP_USER as string,
        SMTP_PASSWORD: process.env.SMTP_PASSWORD as string,
    }
}

export const envVars = loadEnvVariables()