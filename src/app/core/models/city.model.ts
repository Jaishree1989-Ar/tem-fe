import { Department } from "./department.model";

/**
 * Interface representing a City entity.
 */
export interface City {
    cityId: number;
    cityName: string;
    isDeleted: boolean;
    departments?: Department[];
}