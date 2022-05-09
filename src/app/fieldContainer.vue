<script setup lang="ts">
import { ref, toRefs, defineProps, defineEmits, computed} from 'vue';
import { table } from './database_selector'
import { foreign_key_data } from './foreign_key_data';
import { foreign_keys } from './query_builder'
const props = defineProps<{
    fields: {[key:string]:foreign_key_data[]}
    active:boolean
}>()
const { fields, active } = toRefs(props)
const groupBy = (array: any, callback: any)=>array.reduce((a: any,b: any) => ((a[callback(b)]||=[]).push(b),a),{});

const grouped_fields = computed(() => { 
    const first = {
        child: groupBy(fields.value.child, (item:foreign_key_data) => item.relative?.tid ?? 0),
        parent: groupBy(fields.value.parent, (item:foreign_key_data) => item.relative?.tid ?? 0)
    }
    const result: any = {}
    for(const key of Object.keys(first.child)) {
        if(!result[key]) result[key] = {}
        result[key].child = first.child[key]
    }
    for(const key of Object.keys(first.parent)) {
        if(!result[key]) result[key] = {}
        result[key].parent = first.parent[key]
    }
    return result
})

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
const emit = defineEmits(['child', 'parent','update'])
function act(event:string,element:foreign_key_data) {
    if(menu.value?.some(item => item.contains(lastMouseDown.target)))
        return
    emit(event as "child" | "parent", element)
}

const filter = ref('')


</script>


<template>
    <i class="fa fa-search text-muted" style="position:absolute;margin-top:20px;margin-left:15px"></i>
    <input type="text" class="form-control" v-model="filter" style="padding-left:40px">
    <div class="form-control table-content content-data" style="height:70vh">

        <div v-for="field of Object.keys(grouped_fields)" :key="field">
            <span class="table-field separator">
            {{field == 0 ? table : foreign_keys.find(item => item.tid == field).alias}}
            </span>
            <div 
                v-for="child of grouped_fields[field].child?.filter(item => item.REFERENCED_TABLE_NAME.includes(filter))" 
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
                v-for="parent of grouped_fields[field].parent?.filter(item => item.TABLE_NAME.includes(filter))" 
                :key="parent.tid" 
                class="table-field table-parent"
                :class="{'error': !parent.supported && active}"

                @click="act('parent', parent)"
            >
            <div v-if="active" style="display:inline"  @click="$event.stopPropagation()" ref="menu">
                <span style="padding: 10px;" class="dropdown-toggle" @click="parent.display_dropdown = !parent.display_dropdown;" tabindex="0"  @blur="parent.display_dropdown = false"> {{parent.join}}
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

.separator{
    font-weight: bold;
    color: #d39b01;
}
</style>