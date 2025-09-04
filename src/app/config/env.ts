import 'dotenv/config'


interface EnvConfig {
    PORT: string,
    DB_URL: string,
    BCRYPT_SALT_ROUND: string,

    JWT_ACCESS_SECRET: string
}

const loadEnvVariables = (): EnvConfig => {
    const requiredEnvVariables: string[] = ["PORT", "DB_URL", "BCRYPT_SALT_ROUND",
        "JWT_ACCESS_SECRET"
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
    }
}

export const envVars = loadEnvVariables()