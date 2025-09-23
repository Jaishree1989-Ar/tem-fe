import { ModuleAccess } from "./module-access.model";

/**
 * Interface representing a role entity.
 */
export interface Role {
    roleId: number;
    roleName: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
    moduleAccessList: ModuleAccess[];
}
