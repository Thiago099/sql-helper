<script setup lang="ts">
import { ref } from 'vue'
import { connection } from '@/global/mysql'

import fieldContainer from './fieldContainer.vue'
import { foreign_key_data } from './foreign_key_data';

const databases = ref([])
const tables = ref([])

const database = ref<string | null>(null)
const table = ref<string | null>(null)


const foreign_keys = ref<foreign_key_data[]>([])

const fields = ref<{[key:string]:foreign_key_data[]}>({parent:[],child:[]})
interface iaffected{
  name:string,
  object?: foreign_key_data
}
const affected = ref<iaffected[]>([])

const active_fields = ref<{[key:string]:foreign_key_data[]}>({parent:[],child:[]})

const query = ref('')


connection.query('SHOW DATABASES', (err:any, results:any ) => {
  databases.value = results
})

function update()
{
  if(database.value != null)
  {
    connection.query(`USE ${database.value}`)
    connection.query(`SHOW TABLES`, (err:any, results:any ) => {
      const key = Object.keys(results[0])[0]
      tables.value = results.map((result:any) => result[key])
    })
    connection.query(`SELECT 
    KEY_COLUMN_USAGE.TABLE_NAME,
    KEY_COLUMN_USAGE.COLUMN_NAME,
    KEY_COLUMN_USAGE.REFERENCED_TABLE_NAME,
    KEY_COLUMN_USAGE.REFERENCED_COLUMN_NAME
    FROM information_schema.TABLE_CONSTRAINTS
    INNER JOIN information_schema.KEY_COLUMN_USAGE ON TABLE_CONSTRAINTS.CONSTRAINT_NAME = KEY_COLUMN_USAGE.CONSTRAINT_NAME
    WHERE TABLE_CONSTRAINTS.CONSTRAINT_TYPE = 'FOREIGN KEY'
    AND TABLE_CONSTRAINTS.TABLE_SCHEMA = '${database.value}'`, (err, rows) => {
      if (err) {
        console.log(err)
      } else {
        let tid = 0
        rows.forEach((row:foreign_key_data) => {row.tid = tid++;row.display_dropdown = false})
        foreign_keys.value = rows
      }
    })
  }
  active_fields.value = {parent:[],child:[]}
  fields.value = {parent:[],child:[]}
  affected.value = [{name:table.value ?? ''}]
  query.value = ''

}
update()



function update_fields()
{
  active_fields.value = {parent:[],child:[]}
  affected.value = [{name:table.value ?? ''}]
  find_relations()
}


function update_query()
{
  let result = `<span class="highlight">SELECT</span> * <span class="highlight">FROM</span> ${table.value}<br>`


  interface join_data{
    element:foreign_key_data
    parent:string
    child:string
    query:string
  }

  const joins: join_data[] = []
  function join(parent:string, parent_field:string, child:string, child_field:string, alias:string, relative?:foreign_key_data, join?:string)
  {
    return `<span class="highlight">${join} JOIN</span> ${parent == alias ? alias:`${parent} <span class="highlight">AS</span> ${alias}`} <span class="highlight">ON</span> ${alias}.${parent_field} = ${relative?.alias ?? child}.${child_field}<br>`
  }
  for(const child of active_fields.value.child)
  {
    child.supported = false
    joins.push({
      element:child,
      parent:child.TABLE_NAME,
      child:child.REFERENCED_TABLE_NAME,
      query:join(child.REFERENCED_TABLE_NAME,child.REFERENCED_COLUMN_NAME,child.TABLE_NAME,child.COLUMN_NAME,child.alias,child.relative,child.join)
    })
  }
  for(const parent of active_fields.value.parent)
  {
    parent.supported = false
    joins.push({
      element:parent,
      parent:parent.REFERENCED_TABLE_NAME,
      child:parent.TABLE_NAME,
      query: join(parent.TABLE_NAME,parent.COLUMN_NAME,parent.REFERENCED_TABLE_NAME,parent.REFERENCED_COLUMN_NAME,parent.alias,parent.relative,parent.join)
    })
  }

  function build(table_name:string)
  {
    const current = joins.filter((join:join_data) => join.parent == table_name);

    for(const join of current)
    {
      join.element.supported = true
      result += join.query
      build(join.child)
    }
  }
  build(table.value ?? '')

  query.value = result
}
function find_relations()
{
  fields.value = {
      child: foreign_keys.value.filter(
          (item :foreign_key_data) => 
              affected.value.some(affected => affected.name == item.TABLE_NAME) &&
              !active_fields.value.child.includes(item) &&
              !active_fields.value.parent.includes(item)
        ),
      parent: foreign_keys.value.filter(
        (item :foreign_key_data) => 
          affected.value.some(affected => affected.name == item.REFERENCED_TABLE_NAME) && 
          !active_fields.value.parent.includes(item) &&
          !active_fields.value.child.includes(item)
      )
    }
  fields.value.child.forEach((item:foreign_key_data) => 
  {
    item.join = 'INNER'
    item.alias = item.REFERENCED_TABLE_NAME
    item.relative = affected.value.find(affected => affected.name == item.TABLE_NAME)?.object
  })
  fields.value.parent.forEach((item:foreign_key_data) => {
      item.join = 'INNER'
      item.alias = item.TABLE_NAME
      item.relative = affected.value.find(affected => affected.name == item.REFERENCED_TABLE_NAME)?.object
  })

  sort(fields.value)
  update_query()
}


function move(object:foreign_key_data, destination:string)
{
  fields.value[destination] = fields.value[destination].filter((item:foreign_key_data) => item.tid != object.tid)
  active_fields.value[destination].push(object)
  affected.value.push({name:destination == 'child' ? object.REFERENCED_TABLE_NAME : object.TABLE_NAME, object})
  find_relations()
  sort(active_fields.value)
}

function back(object:foreign_key_data, destination:string)
{
  active_fields.value[destination] = active_fields.value[destination].filter((item:foreign_key_data) => item.tid != object.tid)
  fields.value[destination].push(object)
  const table_name = destination == 'child' ? object.REFERENCED_TABLE_NAME : object.TABLE_NAME
  affected.value = affected.value.filter((item:iaffected) => item.name != table_name)
  find_relations()
  sort(fields.value)
}

function sort(object:{[key:string]:foreign_key_data[]})
{
  object.child.sort((a:foreign_key_data, b:foreign_key_data) => a.REFERENCED_TABLE_NAME.localeCompare(b.REFERENCED_TABLE_NAME))
  object.parent.sort((a:foreign_key_data, b:foreign_key_data) => a.TABLE_NAME.localeCompare(b.TABLE_NAME))
}

</script>

<template>
  <div class="container">
    <div class="row">
      <div class="col-6 form-group">
        <label for="">Databases</label>
        <select name="" id="" v-model="database" class="form-select" @change="update()">
          <option :value="Database" v-for="({Database}) in databases" :key="Database"> {{ Database }} </option>
        </select>
      </div>
      <div class="col-6 form-group">
        <label for="">Tables</label>
        <select name="" id="" class="form-select" v-model="table" @change="update_fields()">
          <option :value="table" v-for="table in tables" :key="table"> {{ table }} </option>
        </select>
      </div>
    </div>
    <div class="row content-data">
      <div class="col-4">
        <field-container
          :active="false"
          @child="move($event, 'child')"
          @parent="move($event, 'parent')"
          @update="update_query()"
          :fields="fields"
        />
      </div>
      <div class="col-8">
          <field-container
            :active="true"

            @child="back($event, 'child')"
            @parent="back($event, 'parent')"
            :fields="active_fields"
            @update="update_query()"
          />
      </div>
    </div>
    <div class="row content-data">
      <div class="col">
      <div class="form-control" v-html="query">

      </div>
      </div>
    </div>
  </div>
</template>
<style lang="less">
.row{
  margin-top: 10px !important;
}
.content-data{
  margin-top: 10px;
  height: 100%;
  height: 100%;
  .form-control{
    height: 100%;
    overflow-y: auto;
  }
}

.highlight{
  color: blue;
}



</style>

