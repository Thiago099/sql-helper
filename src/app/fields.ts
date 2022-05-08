import { ref } from 'vue'

export const table_fields = ref<any>([])

import { connection } from '@/global/mysql'

import { affected } from './fields_builder'
import { foreign_key_data } from './foreign_key_data';

export function find_fields()
{
    table_fields.value = []
    for(const element of affected.value)
    {
        find_tables(element.name)
    }

    function find_tables(table:string)
    {
        connection.query(`SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = database() and table_name='${table}'`,
        (error,result)=>{
            table_fields.value.push(result)
        })
    }
}