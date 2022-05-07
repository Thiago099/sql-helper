export interface foreign_key_data {
    tid?:number
    supported?:boolean


    TABLE_NAME: string,
    COLUMN_NAME: string,
    REFERENCED_TABLE_NAME: string
    REFERENCED_COLUMN_NAME: string,
}