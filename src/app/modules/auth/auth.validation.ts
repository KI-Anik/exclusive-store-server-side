import z from "zod";


export const loginZodSchema = z.object({
    // inside body because of validateTRequest.ts
    body: z.object({
        email: z
            .string()
            .email({ message: "Invalid email address" }),
        password: z
            .string()
            .min(6, { message: "password must be at least 6 character long" })

    })
})
