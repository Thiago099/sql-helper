<script setup lang="ts">
import { ref, toRefs, defineProps} from 'vue';
import { foreign_key_data } from './foreign_key_data';
const props = defineProps<{
    fields: {[key:string]:foreign_key_data[]}
    active:boolean
}>()
const { fields,active } = toRefs(props)
</script>


<template>
    <div class="form-control table-content">
        <div 
            v-for="child of fields.child" 
            :key="child.tid" z
            class="table-field table-child"
            :class="{'error': !child.supported && active}"
            @click="$emit('child', child)"
        >
        <span class="table-name">{{ child.REFERENCED_TABLE_NAME }}</span> <span class="table-column">({{ child.COLUMN_NAME }})</span>
        </div>
        <div 
            v-for="parent of fields.parent" 
            :key="parent.tid" 
            class="table-field table-parent"
            :class="{'error': !parent.supported && active}"

            @click="$emit('parent', parent)"
        >
        <span class="table-name">{{ parent.TABLE_NAME }}</span> <span class="table-column">({{ parent.COLUMN_NAME }})</span>
            <div v-if="active" style="display:inline"  @click="$event.stopPropagation()">
                <!-- <span > <span class="dropdown-toggle"> INNER</span>&nbsp;</span>
                <div class="dropdown-menu show">
                    <a class="dropdown-item" href="#">INNER</a>
                    <a class="dropdown-item" href="#">LEFT</a>
                    <a class="dropdown-item" href="#">RIGHT</a>
                </div> -->
                &nbsp;<input type="text" class="form-control" style="display: inline;width: auto;" v-model="parent.alias" @input="$emit('update')">
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