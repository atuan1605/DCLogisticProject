<template>
  <v-autocomplete :items="suggestions" :loading="isGettingSuggestions" v-bind="$attrs" auto-select-first
    v-model:search="searchInput" item-title="customerCode" item-value="customerCode" label="Mã khách hàng"
    :model-value="modelValue" hide-no-data allow-overflow @update:modelValue="updateModelValue"
    @update:search="updateSearchInput" />
</template>

<script setup lang="ts">
import customers, { CustomerSuggestionsInput, CustomersSuggestionsOutput } from '~~/composables/useAPIs/customers'
import * as R from 'ramda'
interface Props {
  modelValue: string | undefined
}
const suggestions = ref<CustomersSuggestionsOutput[]>([])
const isGettingSuggestions = ref(false)
const searchInput = ref<string | undefined>(undefined)
const app = useApp()
const apis = useAPIs()
const props = defineProps<Props>()
const emits = defineEmits(['update:modelValue'])
const updateModelValue = (newValue: string) => {
  emits('update:modelValue', newValue)
}
const updateSearchInput = (newValue: string) => {
  searchInput.value = newValue
}
watch(() => props.modelValue, async (newModelValue) => {
  if (!R.isNil(newModelValue) && newModelValue !== '') {
    isGettingSuggestions.value = true
    try {
      const customers = await apis.customerAPI.getCustomerSelections({ customerCodes: [newModelValue] })
      suggestions.value = customers.map(x => ({
        customerCode: x.customerCode,
        id: x.id
      }))
      searchInput.value = customers.length ? customers[0].customerCode : newModelValue
    } catch (error) {
      app.addErrorToQueue(`${error}`)
    } finally {
      isGettingSuggestions.value = false
    }
  } else {
    suggestions.value = []
    searchInput.value = undefined
  }
}, { immediate: true })
watch(() => searchInput.value, async (newSearchInput) => {
  if (!R.isNil(newSearchInput) && !R.isEmpty(newSearchInput)) {
    const input: CustomerSuggestionsInput = {
      customerCode: newSearchInput
    }
    isGettingSuggestions.value = true
    try {
      const newSuggestions = await apis.customerAPI.getCustomerSuggestions(input)
      if (searchInput.value === newSearchInput) {
        suggestions.value = newSuggestions
        if (newSuggestions.length === 0) {
          updateModelValue(newSearchInput)
        }
      } else {
        console.log('discarding results for', newSearchInput, searchInput.value || '???')
      }
    } catch (error) {
      app.addErrorToQueue(`${error}`)
    } finally {
      isGettingSuggestions.value = false
    }
  } else {
    updateModelValue('')
  }
})
</script>
