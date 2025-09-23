import { City } from "./city.model";
import { Department } from "./department.model";
import { Role } from "./role.model";

/**
 * Interface representing a user entity.
 */
export interface User {
    userId: number;
    userName: string;
    email: string;
    phoneNumber: string;
    password?: string; // Optional
    createdAt?: string; //Optional , ISO timestamp
    updatedAt?: string; //Optional , ISO timestamp
    lastLoggedAt?: string;
    role?: Role;
    city?: City;
    department?: Department;
    isDeleted: boolean;
}

/**
 * Interface representing a users entity.
 */
export interface Users {
    userId: number;
    userName: string;
    email: string;
    phoneNumber: string;
    password?: string; // Optional
    createdAt?: string; //Optional , ISO timestamp
    updatedAt?: string; //Optional , ISO timestamp
    lastLoggedAt?: string;
    roleId?: number;
    cityId?: number;
    deptId?: number;
    isDeleted: boolean;
}