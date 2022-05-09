import { ref } from 'vue'
import { foreign_key_data } from './foreign_key_data';

import { foreign_keys, active_fields, fields, affected, query, find_relations} from './query_builder'

export const databases = ref([])
export const tables = ref([])

export const database = ref<string | null>(null)
export const table = ref<string | null>(null)

import { table_fields } from './fields_selector';

import { connection } from '@/global/mysql'

update_databases()
export function update_databases()
{
    connection.query('SHOW DATABASES', (err: any, results: any) => {
        databases.value = results
    })
}

export function update() {
    if (database.value != null) {
        connection.query(`USE \`${database.value}\``)
        connection.query(`SHOW TABLES`, (err: any, results: any) => {
            const key = Object.keys(results[0])[0]
            tables.value = results.map((result: any) => result[key])
        })
        connection.query(`SELECT 
        KEY_COLUMN_USAGE.TABLE_NAME,
        KEY_COLUMN_USAGE.COLUMN_NAME,
        KEY_COLUMN_USAGE.REFERENCED_TABLE_NAME,
        KEY_COLUMN_USAGE.REFERENCED_COLUMN_NAME
        FROM information_schema.TABLE_CONSTRAINTS
        INNER JOIN information_schema.KEY_COLUMN_USAGE ON TABLE_CONSTRAINTS.CONSTRAINT_NAME = KEY_COLUMN_USAGE.CONSTRAINT_NAME
        WHERE TABLE_CONSTRAINTS.CONSTRAINT_TYPE = 'FOREIGN KEY'
        AND TABLE_CONSTRAINTS.TABLE_SCHEMA = '${database.value}'
        AND KEY_COLUMN_USAGE.TABLE_SCHEMA = '${database.value}'`, (err, rows) => {
            if (err) {
                console.log(err)
            } else {
                let tid = 1
                rows.forEach((row: foreign_key_data) => { row.tid = tid++; row.display_dropdown = false })
                foreign_keys.value = rows
            }
        })
    }
    active_fields.value = { parent: [], child: [] }
    fields.value = { parent: [], child: [] }
    affected.value = [{ name: table.value ?? '' }]
    table_fields.value = []
    query.value = ''
}

export function update_fields() {
    active_fields.value = { parent: [], child: [] }
    affected.value = [{ name: table.value ?? '' }]
    find_relations()
}