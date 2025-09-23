/**
 * Interface representing a API request reponse .
 */
export interface ApiResponse<T> {
    data: T;
    status: string;
    statusCode: number;
}