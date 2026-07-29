import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().min(2, "Customer Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().nullable(),
  phone: z.string().min(1, "Phone number is required").optional().nullable(),
  owner: z.coerce.number().int("Owner must be a valid employee ID").optional().nullable(),
  location: z.string().min(1, "Location is required").optional().nullable(),
  district: z.string().min(1, "District is required").optional().nullable(),
  state: z.string().min(1, "State is required").optional().nullable(),
  sub_state: z.string().min(1, "Sub-State is required").optional().nullable(),
  branch_code: z
    .string()
    .min(1, "Branch Code is required")
    .optional()
    .nullable(),
  branch: z.string().min(1, "Branch is required").optional().nullable(),
  center: z.string().min(1, "Center is required").optional().nullable(),
  center_code: z
    .string()
    .min(1, "Center Code is required")
    .optional()
    .nullable(),
  loanType: z.string().min(1, "Loan Type is required").optional().nullable(),
  loanNo: z.string().min(1, "Loan Number is required").optional().nullable(),
  oldLoanNo: z
    .string()
    .min(1, "Old Loan Number is required")
    .optional()
    .nullable(),
  oldCustomerNo: z
    .string()
    .min(1, "Old Customer Number is required")
    .optional()
    .nullable(),
  image: z.string().optional().nullable(),
  cycle: z.coerce
    .number()
    .int("Cycle must be an integer")
    .optional()
    .nullable(),
  loanDisbDate: z.coerce.date().optional().nullable(),
  loanAmount: z.coerce
    .number("Loan Amount must be a valid number")
    .optional()
    .nullable(),
  os_principal: z.coerce
    .number("O/S Principal must be a valid number")
    .optional()
    .nullable(),
  os_interest: z.coerce
    .number("O/S Interest must be a valid number")
    .optional()
    .nullable(),
  par: z.coerce.number().int("PAR must be an integer").optional().nullable(),
  od_principal: z.coerce
    .number("OD Principal must be a valid number")
    .optional()
    .nullable(),
  od_interest: z.coerce
    .number("OD Interest must be a valid number")
    .optional()
    .nullable(),
  totalDueAmount: z.coerce
    .number("Total Due Amount must be a valid number")
    .optional()
    .nullable(),
  total_principal_collectible: z.coerce
    .number("Total Principal Collectible must be a valid number")
    .optional()
    .nullable(),
  total_interest_collectible: z.coerce
    .number("Total Interest Collectible must be a valid number")
    .optional()
    .nullable(),
  irrRate: z.coerce
    .number("IRR Rate must be a valid number")
    .optional()
    .nullable(),
  noOfInstallment: z.coerce
    .number()
    .int("No of Installment must be an integer")
    .optional()
    .nullable(),
  lastDueDate: z.coerce.date().optional().nullable(),
  lastPaidTrxDate: z.coerce.date().optional().nullable(),
  dpd: z.coerce.number().int("DPD must be an integer").optional().nullable(),
  paidInstNo: z.string().optional().nullable(),
  loanStatus: z.string().optional().nullable(),
  spouseName: z.string().optional().nullable(),
  installmentAmount: z.coerce
    .number("Installment Amount must be a valid number")
    .optional()
    .nullable(),
  maturityDate: z.coerce.date().optional().nullable(),
  pincode: z.string().optional().nullable(),
  preClosureAmt: z.coerce
    .number("Pre-Closure Amount must be a valid number")
    .optional()
    .nullable(),
  closedDate: z.coerce.date().optional().nullable(),
  createdBy: z.coerce.number().int().optional().nullable(),
  updatedBy: z.coerce.number().int().optional().nullable(),
});

export const updateCustomerSchema = z.object({
  name: z
    .string()
    .min(2, "Customer Name must be at least 2 characters")
    .optional(),
  email: z.string().email("Invalid email address").optional().nullable(),
  phone: z.string().min(1, "Phone number is required").optional().nullable(),
  owner: z.coerce.number().int("Owner must be a valid employee ID").optional().nullable(),
  location: z.string().min(1, "Location is required").optional().nullable(),
  district: z.string().min(1, "District is required").optional().nullable(),
  state: z.string().min(1, "State is required").optional().nullable(),
  sub_state: z.string().min(1, "Sub-State is required").optional().nullable(),
  branch_code: z
    .string()
    .min(1, "Branch Code is required")
    .optional()
    .nullable(),
  branch: z.string().min(1, "Branch is required").optional().nullable(),
  center: z.string().min(1, "Center is required").optional().nullable(),
  center_code: z
    .string()
    .min(1, "Center Code is required")
    .optional()
    .nullable(),
  loanType: z.string().min(1, "Loan Type is required").optional().nullable(),
  loanNo: z.string().min(1, "Loan Number is required").optional().nullable(),
  oldLoanNo: z
    .string()
    .min(1, "Old Loan Number is required")
    .optional()
    .nullable(),
  oldCustomerNo: z
    .string()
    .min(1, "Old Customer Number is required")
    .optional()
    .nullable(),
  image: z.string().optional().nullable(),
  cycle: z.coerce
    .number()
    .int("Cycle must be an integer")
    .optional()
    .nullable(),
  loanDisbDate: z.coerce.date().optional().nullable(),
  loanAmount: z.coerce
    .number("Loan Amount must be a valid number")
    .optional()
    .nullable(),
  os_principal: z.coerce
    .number("O/S Principal must be a valid number")
    .optional()
    .nullable(),
  os_interest: z.coerce
    .number("O/S Interest must be a valid number")
    .optional()
    .nullable(),
  par: z.coerce.number().int("PAR must be an integer").optional().nullable(),
  od_principal: z.coerce
    .number("OD Principal must be a valid number")
    .optional()
    .nullable(),
  od_interest: z.coerce
    .number("OD Interest must be a valid number")
    .optional()
    .nullable(),
  totalDueAmount: z.coerce
    .number("Total Due Amount must be a valid number")
    .optional()
    .nullable(),
  total_principal_collectible: z.coerce
    .number("Total Principal Collectible must be a valid number")
    .optional()
    .nullable(),
  total_interest_collectible: z.coerce
    .number("Total Interest Collectible must be a valid number")
    .optional()
    .nullable(),
  irrRate: z.coerce
    .number("IRR Rate must be a valid number")
    .optional()
    .nullable(),
  noOfInstallment: z.coerce
    .number()
    .int("No of Installment must be an integer")
    .optional()
    .nullable(),
  lastDueDate: z.coerce.date().optional().nullable(),
  lastPaidTrxDate: z.coerce.date().optional().nullable(),
  dpd: z.coerce.number().int("DPD must be an integer").optional().nullable(),
  paidInstNo: z.string().optional().nullable(),
  loanStatus: z.string().optional().nullable(),
  spouseName: z.string().optional().nullable(),
  installmentAmount: z.coerce
    .number("Installment Amount must be a valid number")
    .optional()
    .nullable(),
  maturityDate: z.coerce.date().optional().nullable(),
  pincode: z.string().optional().nullable(),
  preClosureAmt: z.coerce
    .number("Pre-Closure Amount must be a valid number")
    .optional()
    .nullable(),
  closedDate: z.coerce.date().optional().nullable(),
  createdBy: z.coerce.number().int().optional().nullable(),
  updatedBy: z.coerce.number().int().optional().nullable(),
});
