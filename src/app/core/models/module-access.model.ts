/**
 * Interface representing a module access entity.
 */
export interface ModuleAccess {
    id: number;
    moduleName: string;
    accessType: 'READ' | 'WRITE' | 'READ_WRITE';
}
