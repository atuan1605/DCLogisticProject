import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import localizedFormat from 'dayjs/plugin/localizedFormat'

export default defineNuxtPlugin(nuxtApp => {
    dayjs.extend(utc)
    dayjs.extend(timezone)
    dayjs.extend(localizedFormat)
    nuxtApp.provide('formatUTCToLocalTime', (utcString: string) => {
        return dayjs.utc(utcString).tz(dayjs.tz.guess()).format('lll')
    })
})