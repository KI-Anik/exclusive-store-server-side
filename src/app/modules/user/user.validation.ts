import z from "zod";

export const createUserZodSchema = z.object({
    // inside body because of validateTRequest.ts
    body: z.object({ 
        name: z
            .string({ invalid_type_error: "Name must be string" })
            .min(2, { message: "name must be at least 2 character long" })
            .max(50, { message: "Name cannot exceed 50 character" }),
        email: z
            .string({ invalid_type_error: "email must be string" })
            .email({ message: "invalid email format" }),
        password: z
            .string({ invalid_type_error: "password must be a string" })
            .min(6, { message: "password must be at least 6 character long" })
    })
})