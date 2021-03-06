import { ref } from 'vue'
import { foreign_key_data } from './foreign_key_data';
import { table } from './database_selector'

export const foreign_keys = ref<foreign_key_data[]>([])

export const fields = ref<{ [key: string]: foreign_key_data[] }>({ parent: [], child: [] })
interface iaffected {
    name: string,
    object?: foreign_key_data
}
export const affected = ref<iaffected[]>([])

export const active_fields = ref<{ [key: string]: foreign_key_data[] }>({ parent: [], child: [] })

export const query = ref('')

import { table_fields, find_fields } from './fields_selector'

export function update_query() {
    let all_selected_tables = true

    let selected_tables = ''

    for(const field of table_fields.value)
    {
        let all_selected_columns = true
        let none_selected = true
        let selected_columns = ''
        for(const column of field.columns)
        {
            if(!column.selected)
            {
                all_selected_tables = false
                all_selected_columns = false
            }
            else
            {
                none_selected = false
                if(column.alias != column.name)
                {
                    all_selected_tables = false
                    all_selected_columns = false
                    selected_columns += `<span class="${field.child==null?'highlight-main':field.child?'highlight-child':'highlight-parent'}">\`${field.table?.object?.alias ?? field.table.name}\`</span>.\`${column.name}\` \`${column.alias}\`,<br>`
                }
                else
                selected_columns += `<span class="${field.child==null?'highlight-main':field.child?'highlight-child':'highlight-parent'}">\`${field.table?.object?.alias ?? field.table.name}\`</span>.\`${column.name}\`,<br>`
            }
        }
        if(!none_selected)
        {
            if(!all_selected_columns)
            {
                selected_tables += selected_columns
            }
            else
            {
                selected_tables += `<span class="${field.child==null?'':field.child?'highlight-child':'highlight-parent'}">\`${field.table?.object?.alias ?? field.table.name}\`</span>.*,<br>`
            }
        }
    }
    const fields = all_selected_tables ? '*' : selected_tables.slice(0, -5) + '<br>'

    let result = `<span class="highlight">SELECT</span> ${fields} <span class="highlight">FROM</span> <span class="highlight-main">\`${table.value}\`</span><br>`


    interface join_data {
        element: foreign_key_data
        parent: string
        child: string
        query: string
    }

    const joins: join_data[] = []
    function join(parent: string, parent_field: string, child: string, child_field: string, alias: string, relative?: foreign_key_data, join?: string, element?:foreign_key_data) {
        const colored_element = `<span class="${element?.child?'highlight-child':'highlight-parent'}">`
        const colored_relative = relative?.alias?`<span class="${relative?.child?'highlight-child':'highlight-parent'}">`:'<span class="highlight-main">'
        return `<span class="highlight">${join} JOIN</span> ${colored_element}${parent == alias ? `\`${alias}\`` : `\`${parent}\` <span class="highlight">AS</span> \`${alias}\``} <span class="highlight">ON</span> \`${alias}\`</span>.\`${parent_field}\` = ${colored_relative}\`${relative?.alias ?? child}\`</span>.\`${child_field}\`<br>`
    }
    for (const child of active_fields.value.child) {
        child.supported = false
        joins.push({
            element: child,
            parent: child.TABLE_NAME,
            child: child.REFERENCED_TABLE_NAME,
            query: join(child.REFERENCED_TABLE_NAME, child.REFERENCED_COLUMN_NAME, child.TABLE_NAME, child.COLUMN_NAME, child.alias, child.relative, child.join,child)
        })
    }
    for (const parent of active_fields.value.parent) {
        parent.supported = false
        joins.push({
            element: parent,
            parent: parent.REFERENCED_TABLE_NAME,
            child: parent.TABLE_NAME,
            query: join(parent.TABLE_NAME, parent.COLUMN_NAME, parent.REFERENCED_TABLE_NAME, parent.REFERENCED_COLUMN_NAME, parent.alias, parent.relative, parent.join,parent)
        })
    }


    function build(table_name: string) {
        const current = joins.filter((join: join_data) => join.parent == table_name);

        for (const join of current) {
            if (joins.filter(item => item.element.tid != join.element.tid && item.element.alias == join.element.alias).length == 0) {
                join.element.supported = true
                result += join.query
            }
            build(join.child)
        }
    }
    build(table.value ?? '')

    query.value = result
}

export function find_relations() {
    fields.value = {
        child: foreign_keys.value.filter(
            (item: foreign_key_data) =>
                affected.value.some(affected => affected.name == item.TABLE_NAME) &&
                !active_fields.value.child.includes(item) &&
                !active_fields.value.parent.includes(item)
        ),
        parent: foreign_keys.value.filter(
            (item: foreign_key_data) =>
                affected.value.some(affected => affected.name == item.REFERENCED_TABLE_NAME) &&
                !active_fields.value.parent.includes(item) &&
                !active_fields.value.child.includes(item)
        )
    }

    fields.value.child.forEach((item: foreign_key_data) => {
        item.relative = affected.value.find(affected => affected.name == item.TABLE_NAME)?.object
    })
    fields.value.parent.forEach((item: foreign_key_data) => {
        item.relative = affected.value.find(affected => affected.name == item.REFERENCED_TABLE_NAME)?.object
    })
    active_fields.value.child.forEach((item: foreign_key_data) => {
        item.child = true
        item.join = item.join ?? 'INNER'
        item.alias = item.alias ?? item.REFERENCED_TABLE_NAME
        item.relative = affected.value.find(affected => affected.name == item.TABLE_NAME)?.object
    })
    active_fields.value.parent.forEach((item: foreign_key_data) => {
        item.child = false
        item.join = item.join ?? 'INNER'
        item.alias = item.alias ?? item.TABLE_NAME
        item.relative = affected.value.find(affected => affected.name == item.REFERENCED_TABLE_NAME)?.object
    })

    sort(fields.value)
    find_fields()
    update_query()
}


export function move(object: foreign_key_data, destination: string) {
    fields.value[destination] = fields.value[destination].filter((item: foreign_key_data) => item.tid != object.tid)
    active_fields.value[destination].push(object)
    object.alias = destination == 'child' ? object.REFERENCED_TABLE_NAME : object.TABLE_NAME
    affected.value.push({ name: destination == 'child' ? object.REFERENCED_TABLE_NAME : object.TABLE_NAME, object })
    find_relations()
    sort(active_fields.value)
    update_query()
}

export function back(object: foreign_key_data, destination: string) {
    active_fields.value[destination] = active_fields.value[destination].filter((item: foreign_key_data) => item.tid != object.tid)
    fields.value[destination].push(object)
    const table_name = destination == 'child' ? object.REFERENCED_TABLE_NAME : object.TABLE_NAME
    affected.value = affected.value.filter((item: iaffected) => item.name != table_name)
    find_relations()
    sort(fields.value)
    update_query()
}


function sort(object: { [key: string]: foreign_key_data[] }) {
    object.child.sort((a: foreign_key_data, b: foreign_key_data) => a.REFERENCED_TABLE_NAME.localeCompare(b.REFERENCED_TABLE_NAME))
    object.parent.sort((a: foreign_key_data, b: foreign_key_data) => a.TABLE_NAME.localeCompare(b.TABLE_NAME))
}