<script setup lang="ts">
import { ref, toRefs, defineProps, defineEmits} from 'vue';
import { foreign_key_data } from './foreign_key_data';
const props = defineProps<{
    fields: {[key:string]:foreign_key_data[]}
    active:boolean
}>()
const { fields,active } = toRefs(props)

let lastMouseDown:any = null;
document.addEventListener(
    "mousedown",
    event => {
        lastMouseDown = event;
    },
    true // A capture handler
);
function prevent(e:Event) {
    e.stopPropagation();
    e.preventDefault();
}

const menu = ref<HTMLElement[]>()
const emit = defineEmits(['child', 'parent'])
function act(event:string,element:foreign_key_data) {
    if(menu.value?.some(item => item.contains(lastMouseDown.target)))
        return
    emit(event as "child" | "parent", element)
}


</script>


<template>
    <div class="form-control table-content">
        <div 
            v-for="child of fields.child" 
            :key="child.tid"
            class="table-field table-child"
            :class="{'error': !child.supported && active}"
            @click="act('child',child)"
        >
        <div v-if="active" style="display:inline"  @click="$event.stopPropagation()" ref="menu">
            <span style="padding: 10px;" class="dropdown-toggle" @click="child.display_dropdown = true;" tabindex="0"  @blur="child.display_dropdown = false"> {{child.join}}
                <div class="dropdown-menu" :class="{'show':child.display_dropdown}" >
                    <a class="dropdown-item" href="#" @mousedown="child.join = 'INNER';$emit('update')">INNER</a>
                    <a class="dropdown-item" href="#" @mousedown="child.join = 'LEFT';$emit('update')">LEFT</a>
                    <a class="dropdown-item" href="#" @mousedown="child.join = 'RIGHT';$emit('update')">RIGHT</a>
                </div>
            </span>&nbsp;
        </div>  
            <span class="table-name">{{ child.REFERENCED_TABLE_NAME }}</span> <span class="table-column">({{ child.COLUMN_NAME }})</span>
            <div v-if="active" style="display:inline"  @click="$event.stopPropagation()" ref="menu">
            &nbsp;<input type="text" class="form-control" style="display: inline;width: 150px;margin:0px" v-model="child.alias" @input="$emit('update')">
            </div>
        </div>
        <div 
            v-for="parent of fields.parent" 
            :key="parent.tid" 
            class="table-field table-parent"
            :class="{'error': !parent.supported && active}"

            @click="act('parent', parent)"
        >
        <div v-if="active" style="display:inline"  @click="$event.stopPropagation()" ref="menu">
            <span style="padding: 10px;" class="dropdown-toggle" @click="parent.display_dropdown = true;" tabindex="0"  @blur="parent.display_dropdown = false"> {{parent.join}}
                <div class="dropdown-menu" :class="{'show':parent.display_dropdown}" >
                    <a class="dropdown-item" href="#" @mousedown="parent.join = 'INNER';$emit('update')">INNER</a>
                    <a class="dropdown-item" href="#" @mousedown="parent.join = 'LEFT';$emit('update')">LEFT</a>
                    <a class="dropdown-item" href="#" @mousedown="parent.join = 'RIGHT';$emit('update')">RIGHT</a>
                </div>
            </span>&nbsp;
        </div>  
        <span class="table-name">{{ parent.TABLE_NAME }}</span> <span class="table-column">({{ parent.COLUMN_NAME }})</span>
            <div v-if="active" style="display:inline"  @click="$event.stopPropagation()" ref="menu">
                &nbsp;<input type="text" class="form-control" style="display: inline;width: 150px;margin:0px" v-model="parent.alias" @input="$emit('update')">
            </div>
        </div>
    </div>
</template>

<style scoped>
.table-name{
    color: #00a65a;
}
.table-child .table-column{
    color: #12c6f3;
}
.table-parent .table-column{
    color: #f554d2;
}
.table-field{
    padding: .375rem .75rem;
    border-radius: .25rem;
    cursor: pointer;
}
.table-field:hover{
    background-color: #f5f5f5;
}

.table-content{
    padding: 0px;
}
.error{
    border:1px solid red;
    border-style: dashed;
}
</style>