export interface foreign_key_data {
    tid?:number
    supported?:boolean
    alias:string,
    relative?:foreign_key_data,
    join:string,
    display_dropdown?:boolean,

    TABLE_NAME: string,
    COLUMN_NAME: string,
    REFERENCED_TABLE_NAME: string
    REFERENCED_COLUMN_NAME: string,
}