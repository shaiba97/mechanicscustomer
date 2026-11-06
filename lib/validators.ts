import { z } from "zod";

export const vinSchema = z.string().length(17, "VIN must be exactly 17 characters.");

export const loginSchema = z.object({
  phoneNumber: z.string().regex(/^[0-9]{10,15}$/, "Invalid phone number."),
});

export const registerSchema = z.object({
  phoneNumber: z.string().regex(/^[0-9]{10,15}$/, "Invalid phone number."),
  fullName: z.string().min(2, "Full name is required."),
});

export const vehicleSchema = z.object({
  nickname: z.string().min(1, "Nickname is required.").optional(),
  vin: z.string().length(17, "VIN must be exactly 17 characters.").optional().or(z.literal("")),
  make: z.string().min(1, "Make is required."),
  model: z.string().min(1, "Model is required."),
  year: z.number().min(1980, "Year must be after 1980.").max(2030, "Year must be before 2030."),
  is_primary: z.boolean().optional(),
});

export const checkoutItemSchema = z.object({
  inventory_item_id: z.string().uuid("Invalid item ID."),
  quantity: z.number().int().min(1, "Quantity must be at least 1."),
});

export const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, "At least one item is required."),
  store_id: z.string().uuid("Invalid store ID."),
  vehicle_id: z.string().uuid().optional().nullable(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type VehicleInput = z.infer<typeof vehicleSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const ksaCitySlugs = [
  "riyadh",
  "kharj",
  "jeddah",
  "makkah",
  "dammam",
  "khobar",
  "dhahran",
  "qatif",
  "madinah",
  "taif",
  "buraidah",
  "ahsa",
  "yanbu",
  "abha",
  "tabuk",
  "hail",
  "najran",
  "jazan",
] as const;

/** Normalize a Saudi phone input (with +966 prefix or local format) to pure digits. */
export function normalizeSaudiPhone(input: string): string {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("00966")) digits = digits.slice(5);
  else if (digits.startsWith("966")) digits = digits.slice(3);
  if (digits.startsWith("0")) digits = digits.replace(/^0+/, "");
  return `966${digits}`;
}

export function isValidSaudiPhone(input: string): boolean {
  const normalized = normalizeSaudiPhone(input);
  const local = normalized.slice(3);
  return local.startsWith("5") && local.length === 9;
}

export const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  phone: z
    .string()
    .refine((value) => isValidSaudiPhone(value), "Enter a valid Saudi mobile number (e.g. 0501234567).")
    .optional()
    .or(z.literal("")),
  city: z.enum(ksaCitySlugs).optional().or(z.literal("")),
  street: z.string().max(200, "Street is too long.").optional().or(z.literal("")),
});

export type ProfileInput = z.infer<typeof profileSchema>;
