import * as R from 'ramda'

export const useValidators = () => ({
    required: (fieldName: string) => (v: string | null | undefined) => !(R.isNil(v) || R.isEmpty(v)) || `Field ${fieldName} is required`,
    min: (min: number) => (v: string | null | undefined) => {
        if (R.isNil(v) || R.isEmpty(v)) {
          return true
        }
    
        const number = parseFloat(v)
        return (number >= min) || `Minimum: ${min}`
      },
      max: (max: number) => (v: string | null | undefined) => {
        if (R.isNil(v) || R.isEmpty(v)) {
          return true
        }
    
        const number = parseFloat(v)
        return (number <= max) || `Maximum: ${max}`
      },
      int: (v: string | null | undefined) => {
        if (R.isNil(v) || R.isEmpty(v)) {
          return true
        }
    
        const number = parseFloat(v)
        return ((!R.equals(number, NaN)) && Number.isInteger(number)) || 'Invalid Integer'
      },
      number: (v: string | null | undefined) => {
        if (R.isNil(v) || R.isEmpty(v)) {
          return true
        }
    
        const float = parseFloat(v)
        return (!R.equals(float, NaN)) || 'Invalid Number'
      },
      minLength: (length: number) => (v: string | null | undefined) => {
        return R.length(v || '') >= length || `Min length: ${length}`
      },
})