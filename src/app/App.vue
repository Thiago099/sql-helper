<script setup lang="ts">
import { ref } from 'vue'
import { connection } from '@/global/mysql'

import fieldContainer from '@/components/fieldContainer.vue'
import func from 'vue-temp/vue-editor-bridge'

const databases = ref([])
const tables = ref([])

const database = ref<string | null>(null)
const table = ref<string | null>(null)

const foreign_keys = ref<foreign_key_data[]>([])

interface foreign_key_data {
  tid?:number
  TABLE_NAME: string,
  COLUMN_NAME: string,
  REFERENCED_TABLE_NAME: string
  REFERENCED_COLUMN_NAME: string,
}

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
        rows.forEach((row:foreign_key_data) => row.tid = tid++)
        foreign_keys.value = rows
      }
    })
  }
}
update()

const fields = ref<{[key:string]:foreign_key_data[]}>({parent:[],child:[]})

const affected = ref<string[]>([])

function update_fields()
{
  active_fields.value = {parent:[],child:[]}
  affected.value = [table.value ?? '']
  find_relations()
}



function find_relations()
{
  fields.value = {
      child: foreign_keys.value.filter(
          (item :foreign_key_data) => 
          affected.value.includes(item.TABLE_NAME) && 
          !active_fields.value.child.includes(item) &&
          !active_fields.value.parent.includes(item)
        ),
      parent: foreign_keys.value.filter(
        (item :foreign_key_data) => 
          affected.value.includes(item.REFERENCED_TABLE_NAME) && 
          !active_fields.value.parent.includes(item) &&
          !active_fields.value.child.includes(item)
      )
    }
  sort(fields.value)
}

const active_fields = ref<{[key:string]:foreign_key_data[]}>({parent:[],child:[]})
function move(object:foreign_key_data, destination:string)
{
  fields.value[destination] = fields.value[destination].filter((item:foreign_key_data) => item.tid != object.tid)
  active_fields.value[destination].push(object)
  affected.value.push(destination == 'child' ? object.REFERENCED_TABLE_NAME : object.TABLE_NAME)
  find_relations()
  sort(active_fields.value)
}

function back(object:foreign_key_data, destination:string)
{
  active_fields.value[destination] = active_fields.value[destination].filter((item:foreign_key_data) => item.tid != object.tid)
  fields.value[destination].push(object)
  const table_name = destination == 'child' ? object.REFERENCED_TABLE_NAME : object.TABLE_NAME
  affected.value = affected.value.filter((item:string) => item != table_name)
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
      <div class="col-6">
        <field-container
          @child="move($event, 'child')"
          @parent="move($event, 'parent')"
          :fields="fields"
        />
      </div>
      <div class="col-6">
          <field-container
            @child="back($event, 'child')"
            @parent="back($event, 'parent')"
            :fields="active_fields"
          />
      </div>
    </div>
    <div class="row content-data">
      <div class="col">
      <div class="form-control">
        {{active_fields}}
      </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="less">
.container{
  margin-top: 10px;
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

</style>

