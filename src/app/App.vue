<script setup lang="ts">
import { ref } from 'vue'
import fieldContainer from './fieldContainer.vue'

import { database, databases, table, tables, update_databases ,update, update_fields } from './database_selector'

import { move, back, active_fields, update_query, fields, query } from './query_builder'

import { table_fields } from './fields_selector'

update()

function set_selected(e:any, objects:any)
{
    const value = e.target?.checked;
    objects.forEach((object:any) => {
        object.selected = value;
    });
    update_query()
}

</script>

<template>
  <div class="container" >
    <div class="row">
      <div class="col-6 form-group">
        <label for="">Databases</label>
        <div class="input-group">
          <select name="" id="" v-model="database" class="form-select" @change="update()">
            <option :value="Database" v-for="({Database}) in databases" :key="Database"> {{ Database }} </option>
          </select>
            <button class="btn btn-primary" @click="update_databases();update()"><i class="fa fa-rotate-left" ></i></button>
        </div>
      </div>
      <div class="col-6 form-group">
        <label for="">Tables</label>
        <div class="input-group">
          <select name="" id="" class="form-select" v-model="table" @change="update_fields()">
            <option :value="table" v-for="table in tables" :key="table"> {{ table }} </option>
          </select>
          <button class="btn btn-primary" @click="update()"><i class="fa fa-rotate-left" ></i></button>
        </div>
      </div>
    </div>
    <div class="row">
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
    <div class="content-data form-control">
      <div v-for="({table, columns}) of table_fields" :key="table">
      <input type="checkbox" :checked="columns.every((item: any) => item.selected == true)" @click="set_selected($event, columns)">   {{table?.object?.alias ?? table.name}}
        <div v-for="(column) of columns" :key="column.name">
          &nbsp;&nbsp;&nbsp;&nbsp;<input type="checkbox" v-model="column.selected" @change="update_query()"> {{column.name}}
        </div >
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
  height: 26vh;
  display:block;
  overflow-y: auto;
  margin-top: 10px;
  display: inline-block;
  .form-control{
    height:80%;

    overflow-y: auto;
  }
}

.highlight{
  color: blue;
}

.highlight-child{
    color: #12c6f3;
}

.highlight-parent{
    color: #f554d2;
}
.highlight-main{
    color: #00a65a;
}
</style>

