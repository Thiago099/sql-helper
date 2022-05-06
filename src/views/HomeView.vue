<script setup lang="ts">
import {  ref } from 'vue'
import { connection } from '@/global/mysql'

const databases = ref([])
const tables = ref([])

const database = ref(null)
const table = ref(null)

const foreign_keys = ref<foreign_key_data[]>([])

interface foreign_key_data {
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
        foreign_keys.value = rows
      }
    })
  }
}
update()

const fields = ref<foreign_key_data[]>([])
function update_fields()
{
  fields.value = foreign_keys.value.filter((item :foreign_key_data) => item.TABLE_NAME == table.value)
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
      <div class=" col-6">
        <div class="form-control">
          {{table}}
          {{fields}}
        </div>
      </div>
      <div class=" col-6">
        <div class="form-control"></div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.content-data{
  margin-top: 10px;
}
</style>

