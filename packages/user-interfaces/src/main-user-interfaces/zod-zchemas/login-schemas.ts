import z from "zod";


export const LoginScema = z.object({
    email: z.string(),
    password: z.string(),
})


export type LoginScemaUser = z.infer<typeof LoginScema>


export const RegisterSchema = z.object({
    login: z.string().min(3, 'Login should be more than 3 character'),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password should be more then 6 character'),
    passwordConfirm: z.string()
}).refine((data) => data.password === data.passwordConfirm, {
    message: 'Password is not Match',
    path: ['passwordConfirm']
})

export type RegisterSchemaUser = z.infer<typeof RegisterSchema>