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

const fields = ref({})
function update_fields()
{
  fields.value = {
      child:foreign_keys.value.filter((item :foreign_key_data) => item.TABLE_NAME == table.value),
      parent:foreign_keys.value.filter((item :foreign_key_data) => item.REFERENCED_TABLE_NAME == table.value)
    }
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
        <div class="form-control field-container">
          <div v-for="child of fields.child" :key="child" class="table-field table-child">
            <span class="table-name">{{ child.REFERENCED_TABLE_NAME }}</span> <span class="table-column">({{ child.COLUMN_NAME }})</span>
          </div>
          <div v-for="parent of fields.parent" :key="parent" class="table-field table-parent">
            <span class="table-name">{{ parent.TABLE_NAME }}</span> <span class="table-column">({{ parent.COLUMN_NAME }})</span>
          </div>
        </div>
      </div>
      <div class=" col-6">
        <div class="form-control">
          {{fields}}
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.content-data{
  margin-top: 10px;
}
.table-column{
  color: #00a65a;
}
.table-child .table-name{
  color: #f39c12;
}
.table-parent .table-name{
  color: #f56954;
}

.table-field{
  padding: .375rem .75rem;
  border-radius: .25rem;
}
.table-field:hover{
  background-color: #f5f5f5;
}
.field-container{
  padding: 0px;
}
</style>

