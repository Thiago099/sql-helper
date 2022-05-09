import { ref } from 'vue'

export const table_fields = ref<any>([])

import { connection } from '@/global/mysql'

import { affected } from './query_builder'
import { foreign_key_data } from './foreign_key_data';

export function find_fields()
{
    const old = table_fields.value
    table_fields.value = []
    for(const element of affected.value)
    {
        find_tables(element)
    }

    function find_tables(table: any)
    {
        connection.query(`SELECT COLUMN_NAME \`column\` FROM information_schema.columns WHERE table_schema = database() and table_name='${table.name}' ORDER BY COLUMN_NAME`,
        (error:any,result:any)=>{
            const columns:any = []
            const old_value = old.find((item:any) => item.table == table)
            if(old_value)
            {
                table_fields.value.push(old_value)
            }
            else
            {
                result.forEach((item:any) => columns.push({name:item.column,selected:true}))
                table_fields.value.push({table,child:table.object?.child,columns})
            }
        })
    }
}