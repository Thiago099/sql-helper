<script setup lang="ts">
import { ref, toRefs, defineProps} from 'vue';
const props = defineProps<{
    fields: string
}>()
const { fields } = toRefs(props)
</script>


<template>
    <div class="form-control table-content">
        <div 
            v-for="child of fields.child" 
            :key="child" 
            class="table-field table-child"
            @click="$emit('child', child)"
        >
        <span class="table-name">{{ child.REFERENCED_TABLE_NAME }}</span> <span class="table-column">({{ child.COLUMN_NAME }})</span>
        </div>
        <div 
            v-for="parent of fields.parent" 
            :key="parent" 
            class="table-field table-parent"
            @click="$emit('parent', parent)"
        >
        <span class="table-name">{{ parent.TABLE_NAME }}</span> <span class="table-column">({{ parent.COLUMN_NAME }})</span>
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
</style>