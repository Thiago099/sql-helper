<script setup lang="ts">
import { onMounted, ref } from 'vue'

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

const filter = ref('')

const tab = ref('Join')
const tabs = ['Join', 'Fields', 'Result']

const element = ref()

onMounted(()=>{
  element.value.setAttribute('contenteditable', true);
  element.value.spellcheck = false;
  element.value.oncut = () => false;
  element.value.onpaste = () => false;
  element.value.onkeydown = (event:any) => {
    if (event.metaKey || event.ctrlKey) {
      return;
    }
    event.preventDefault();
  }
})
</script>

<template>
  <div class="container">
    <ul class="nav nav-tabs">
      <li class="nav-item" v-for="tab_link in tabs" :key="tab_link">
        <a class="nav-link" :class="{'active': tab_link == tab}" aria-current="page" href="#" @click="tab = tab_link">{{tab_link}}</a>
      </li>
    </ul>
    <div v-show="tab == 'Join'">
      <div class="row">
        <div class="col-6 form-group">
          <label for="">Databases</label>
          <div class="input-group">
            <select name="" id="" v-model="database" class="form-select" @change="update()">
              <option :value="Database" v-for="({Database}) in databases" :key="Database"> {{ Database }} </option>
            </select>
              <button class="btn btn-primary" @click="update_databases();update();database=null;table=null"><i class="fa fa-rotate-left" ></i></button>
          </div>
        </div>
        <div class="col-6 form-group">
          <label for="">Tables</label>
          <div class="input-group">
            <select name="" id="" class="form-select" v-model="table" @change="update_fields();">
              <option :value="table" v-for="table in tables" :key="table"> {{ table }} </option>
            </select>
            <button class="btn btn-primary" @click="update();table=null"><i class="fa fa-rotate-left" ></i></button>
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
    </div>
    <div v-show="tab == 'Fields'">
      <i class="fa fa-search text-muted" style="position:absolute;margin-top:10px;margin-left:15px"></i>
      <input type="text" class="form-control" v-model="filter" style="padding-left:40px">
      <div class="content-data form-area form-control" style="height:70vh">
        <div v-for="({table, columns}) of table_fields" :key="table" >
        <input type="checkbox" :checked="columns.every((item) => item.selected == true)" @click="set_selected($event, columns)"> {{table?.object?.alias ?? table.name}}
          <div v-for="(column) of columns.filter(item=>item.name.includes(filter))" :key="column.name">
            &nbsp;&nbsp;&nbsp;&nbsp;<input type="checkbox" v-model="column.selected" @change="update_query()"> {{column.name}} 
            <input type="text" v-model="column.alias" @change="update_query()" class="form-control" style="display:inline;width:200px;height:25px;margin:5px">
          </div >
        </div>
      </div>
    </div>
    <div v-show="tab == 'Result'">
      <div class="row content-data form-control" style="height:85vh;caret-color: transparent;" ref="element">
        <div class="col">
          <div class="form-area" v-html="query">
          </div>
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
  display:block;
  overflow-y: auto;
  margin-top: 10px;
  display: inline-block;
  .form-area{
    height:80%;

    overflow-y: auto;
  }
}
.form-control{
  margin-top:10px;
  margin-bottom: 20px;
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

