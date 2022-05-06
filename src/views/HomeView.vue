<script setup lang="ts">
import { ref } from 'vue'
import { connection } from '@/global/mysql'
const databases = ref([])
const tables = ref([])

const database = ref(null)
const table = ref(null)

const foreign_keys = ref([])

connection.query(`SELECT 
KEY_COLUMN_USAGE.TABLE_NAME,
KEY_COLUMN_USAGE.COLUMN_NAME,
KEY_COLUMN_USAGE.REFERENCED_TABLE_NAME,
KEY_COLUMN_USAGE.REFERENCED_COLUMN_NAME
FROM information_schema.TABLE_CONSTRAINTS
INNER JOIN information_schema.KEY_COLUMN_USAGE ON TABLE_CONSTRAINTS.CONSTRAINT_NAME = KEY_COLUMN_USAGE.CONSTRAINT_NAME
WHERE TABLE_CONSTRAINTS.CONSTRAINT_TYPE = 'FOREIGN KEY'
AND TABLE_CONSTRAINTS.TABLE_SCHEMA = DATABASE()`, (err, rows) => {
  if (err) {
    console.log(err)
  } else {
    foreign_keys.value = rows
  }
})

connection.query('SHOW DATABASES', (err:any, results:any ) => {
  databases.value = results
})

function updateDatabase(event:any)
{
  if(database.value != null)
  {
    connection.query(`USE ${database.value}`)
    connection.query(`SHOW TABLES`, (err:any, results:any ) => {
      const key = Object.keys(results[0])[0]
      tables.value = results.map((result:any) => result[key])
    })
  }
}
updateDatabase()
// connection.query('use meaning')
// connection.query('SHOW TABLES', (err:any, results:any ) => {
//   const key = Object.keys(results[0])[0]
//   databases.value = results.map((item:any)=> item[key])
// })
</script>

<template>
  <div class="container">
    <div class="row">
      <div class="col-6 form-group">
        <label for="">Databases</label>
        <select name="" id="" v-model="database" class="form-select" @change="updateDatabase($event)">
          <option :value="Database" v-for="({Database}) in databases" :key="Database"> {{ Database }} </option>
        </select>
      </div>

      <div class="col-6 form-group">
        <label for="">Tables</label>
        <select name="" id="" class="form-select" v-model="table">
          <option :value="table" v-for="table in tables" :key="table"> {{ table }} </option>
        </select>
      </div>
    </div>
  </div>
</template>

