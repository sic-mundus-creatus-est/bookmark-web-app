import { z } from "zod";

export const signUpSchema = z
  .object({
    displayName: z.string().trim().nonempty("Name is required"),

    username: z
      .string()
      .nonempty("Username is required")
      .min(2, "Username must be at least 2 characters")
      .regex(
        /^[a-zA-Z0-9\-._]+$/,
        "Username can only include letters, digits, and the following symbols: - . _"
      )
      .refine((val) => !/[-._]{2}/.test(val), {
        message: "Username cannot include consecutive - . _",
      })
      .refine((val) => !/^[-._]/.test(val), {
        message: "Username cannot start with - . _",
      })
      .refine((val) => !/[-._]$/.test(val), {
        message: "Username cannot end with - . _",
      }),

    email: z.email("Enter a valid e-mail."),

    password: z
      .string()
      .min(6, "Password must be at least 6 characters.")
      .regex(/[0-9]/, "Password must contain at least one digit.")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
      .regex(
        /[^a-zA-Z0-9]/,
        "Password must contain at least one non-alphanumeric character."
      ),

    confirmPassword: z.string().nonempty("Please, confirm the password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
