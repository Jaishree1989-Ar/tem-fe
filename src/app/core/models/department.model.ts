import { City } from "./city.model";

/**
 * Interface representing a department entity.
 */
export interface Department {
    deptId: number;
    deptName: string;
    deptNumber: string;
    description: string;
    lastInvoicedAt?: string; // ISO timestamp
    city?: City;
    isDeleted: boolean;
}

export interface DepartmentAccount {
    id: number;
    foundationAccountNumber: string;
    departmentAccountNumber: string;
    department: string;
    createdBy: string;
}

export interface DepartmentData {
    id: string;
    foundationAccountNumber: string;
    departmentAccountNumber: string;
    department: string;
    carrier: string;
    createdBy: string;
}