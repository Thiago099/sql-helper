import { ref } from 'vue'

export const table_fields = ref<any>([])

import { connection } from '@/global/mysql'

import { affected } from './query_builder'
import { foreign_key_data } from './foreign_key_data';

export function find_fields()
{
    table_fields.value = []
    for(const element of affected.value)
    {
        find_tables(element)
    }

    function find_tables(table: any)
    {
        connection.query(`SELECT COLUMN_NAME \`column\` FROM information_schema.columns WHERE table_schema = database() and table_name='${table.name}'`,
        (error,result)=>{
            const columns:any = []
            console.log(table.object?.child)
            result.forEach((item:any) => columns.push({name:item.column,child:table.object?.child,selected:true}))
            table_fields.value.push({table:table.name,columns})
        })
    }
}