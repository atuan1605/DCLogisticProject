<template>
    <v-container>
        <div class="tw-flex tw-flex-row tw-justify-between">
            <v-col class="tw-flex tw-flex-col tw-justify-center tw-p-6 pa-0">
                <div class="tw-flex tw-flex-col tw-justify-center">
                    <div class=" tw-flex tw-flex-col tw-gap-2 tw-items-center tw-justify-between tw-w-full">
                        <template v-if="!R.isNil(props.item.receivedAtUSAt)">
                            <p class="tw-font-primary tw-text-sm tw-h-6 tw-text-red-600">{{
                            dayjs.utc(props.item.receivedAtUSAt).format('DD-MM-YYYY') }}</p>
                        </template>
                        <template v-else>
                            <p class="tw-font-primary tw-text-sm tw-h-6"></p>
                        </template>
                        <div class=" tw-flex tw-flex-row tw-w-full">
                            <div class="tw-flex tw-flex-1 "></div>
                            <div :class="[!R.isNil(props.item.receivedAtUSAt) ? 'tw-bg-red-600' : 'tw-bg-gray-300']"
                                class=" tw-w-8 tw-h-8 tw-flex tw-items-center tw-justify-center tw-rounded-full">
                                <v-icon
                                    :color="[!R.isNil(props.item.receivedAtUSAt) ? 'white' : '']">mdi-package-variant</v-icon>
                            </div>
                            <template v-if="!R.isNil(props.item.flyingBackAt) && !R.isNil(props.item.receivedAtUSAt)">
                                <div class="tw-flex tw-flex-1 tw-border-b-2 tw-border-red-600 tw-h-1/2">
                                </div>
                            </template>
                            <template v-else>
                                <div class="tw-flex tw-flex-1 tw-border-b-2 tw-h-1/2"></div>
                            </template>

                        </div>
                        <p :class="[!R.isNil(props.item.receivedAtUSAt) ? 'tw-text-red-600' : '']"
                            class="tw-font-primary tw-text-sm tw-overflow-visible tw-w-full tw-text-center ">
                            Kho US
                        </p>
                    </div>
                </div>
            </v-col>
            <v-col  class="tw-flex tw-flex-col tw-justify-center pa-0">
                <div class="tw-flex tw-flex-col tw-justify-center">
                    <div class=" tw-flex tw-flex-col tw-gap-2 tw-justify-between tw-items-center tw-w-full">
                        <template v-if="!R.isNil(props.item.flyingBackAt)">
                            <p class="tw-font-primary tw-text-sm tw-h-6 tw-text-red-600">{{
                            dayjs.utc(props.item.flyingBackAt).format('DD-MM-YYYY') }}</p>
                        </template>
                        <template v-else>
                            <p class="tw-font-primary tw-text-sm tw-h-6"></p>
                        </template>
                        <div class="tw-flex tw-flex-row tw-w-full">
                            <template v-if="!R.isNil(props.item.flyingBackAt) && !R.isNil(props.item.receivedAtUSAt)">
                                <div class="tw-flex tw-flex-1 tw-border-b-2 tw-border-red-600 tw-h-1/2">
                                </div>
                            </template>
                            <template v-else>
                                <div class="tw-flex tw-flex-1 tw-border-b-2 tw-h-1/2"></div>
                            </template>
                            <div :class="[!R.isNil(props.item.flyingBackAt) ? 'tw-bg-red-600' : 'tw-bg-gray-300']"
                                class=" tw-w-8 tw-h-8 tw-flex tw-items-center tw-justify-center tw-rounded-full">
                                <v-icon
                                    :color="[!R.isNil(props.item.flyingBackAt) ? 'white' : '']">mdi-airplane</v-icon>
                            </div>
                            <template v-if="!R.isNil(props.item.receivedAtVNAt) && !R.isNil(props.item.flyingBackAt)">
                                <div class="tw-flex tw-flex-1 tw-border-b-2 tw-border-red-600 tw-h-1/2">
                                </div>
                            </template>
                            <template v-else>
                                <div class="tw-flex tw-flex-1 tw-border-b-2 tw-h-1/2"></div>
                            </template>
                        </div>
                        <p :class="[!R.isNil(props.item.flyingBackAt) ? 'tw-text-red-600' : '']"
                            class="tw-font-primary tw-text-sm tw-overflow-visible tw-w-full tw-text-center ">
                            On the way
                        </p>

                    </div>
                </div>
            </v-col>
            <v-col  class="tw-flex tw-flex-col tw-justify-center pa-0">
                <div class="tw-flex tw-flex-col tw-justify-center">
                    <div class=" tw-flex tw-flex-col tw-gap-2 tw-justify-between tw-items-center tw-w-full">
                        <template v-if="!R.isNil(props.item.receivedAtVNAt)">
                            <p class="tw-font-primary tw-text-sm tw-h-6 tw-text-red-600">{{
                            dayjs.utc(props.item.receivedAtVNAt).format('DD-MM-YYYY') }}</p>
                        </template>
                        <template v-else>
                            <p class="tw-font-primary tw-text-sm tw-h-6"></p>
                        </template>
                        <div class="tw-flex tw-flex-row tw-w-full">
                            <template v-if="!R.isNil(props.item.receivedAtVNAt) && !R.isNil(props.item.flyingBackAt)">
                                <div class="tw-flex tw-flex-1 tw-border-b-2 tw-border-red-600 tw-h-1/2">
                                </div>
                            </template>
                            <template v-else>
                                <div class="tw-flex tw-flex-1 tw-border-b-2 tw-h-1/2"></div>
                            </template>
                            <div :class="[!R.isNil(props.item.receivedAtVNAt) ? 'tw-bg-red-600' : 'tw-bg-gray-300']"
                                class=" tw-w-8 tw-h-8 tw-flex tw-items-center tw-justify-center tw-rounded-full">
                                <v-icon
                                    :color="[!R.isNil(props.item.receivedAtVNAt) ? 'white' : '']">mdi-package-variant</v-icon>
                            </div>
                            <div class="tw-flex tw-flex-1 "></div>
                        </div>
                        <p :class="[!R.isNil(props.item.receivedAtVNAt) ? 'tw-text-red-600' : '']"
                            class="tw-font-primary tw-text-sm tw-overflow-visible tw-w-full tw-text-center ">
                            Kho VN
                        </p>

                    </div>
                </div>
            </v-col>
        </div>

    </v-container>
</template>

<script setup lang="ts">
import { LabelOutput } from '~~/composables/useAPIs/labels';
import dayjs from 'dayjs'
import * as R from 'ramda'

interface Props {
    item: LabelOutput
}

const props = defineProps<Props>()
</script>