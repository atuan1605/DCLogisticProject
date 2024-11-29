<template>
    <v-navigation-drawer expand-on-hover v-model="appStore.isShowingSideBar" v-model:rail="appStore.isSideBarMini" app
        v-model:mini-variant="appStore.isSideBarMini">
        <v-list>
            <v-list-item prepend-icon="mdi-account">
                <template #title>
                    <div :class="[appStore.isSideBarMini ? '' : 'tw-whitespace-normal']">{{ authStore.username }}</div>
                </template>
            </v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-list density="compact" nav>
            <template v-for="section, index in navSections" :key="index">
                <v-list-subheader v-text="section.name" />
                <v-list-item :title="item.name" :to="item.path" v-for="item, index in section.items" :key="index"
                    :value="item.path" color="primary">
                    <template v-slot:append v-if="R.has('notiCount', item) && !appStore.isSideBarMini">
                        <v-badge color="primary" :content="item.notiCount" inline></v-badge>
                    </template>
                    <template v-slot:prepend>
                        <v-badge v-if="R.has('notiCount', item) && appStore.isSideBarMini" :content="item.notiCount"
                            color="primary">
                            <v-icon :icon="item.icon"></v-icon>
                        </v-badge>
                        <v-icon v-else :icon="item.icon"></v-icon>
                    </template>
                </v-list-item>
            </template>
        </v-list>
    </v-navigation-drawer>
</template>

<script setup lang="ts">
import * as R from "ramda";
import { ComputedRef } from "vue";
import { useReportData } from "~~/composables";
const appStore = useApp()
const authStore = useAuth()
const reportStore = useReportData()

interface NavItem {
    name: string,
    path: string,
    scopes: string[],
    icon: string,
    notiCount?: number,
}

interface NavSection {
    name: string,
    items: NavItem[]
}

const allSections: ComputedRef<NavSection[]> = computed(() => {
    return [
        {
            name: "System",
            items: [
                {
                    name: "User",
                    path: "/users",
                    icon: 'mdi-cog',
                    scopes: ["userList"],
                },
                {
                    name: "Kho",
                    path: "/warehouse",
                    icon: 'mdi-warehouse',
                    scopes: ["warehouseList"]
                },
                {
                    name: "Đại lý",
                    path: "/agent",
                    icon: 'mdi-warehouse',
                    scopes: ["agentList"]
                }
            ],

        },
        {
            name: "Đại lý",
            items: [
                {
                    name: "Thống kê",
                    path: "/trackingReport",
                    icon: 'mdi-list-box',
                    scopes: ["agentTracking"],
                },
                {
                    name: "Sản phẩm có yêu cầu đặc biệt",
                    path: "/packingRequests",
                    icon: "mdi-archive-star",
                    scopes: ["agentTracking"]
                }
            ]
        },
        {
            name: "Camera",
            items: [
                {
                    name: "Trích xuất Video",
                    path: "/packingVideo",
                    icon: 'mdi-camera',
                    scopes: ['camera'],
                }
            ]
        },
        {
            name: "Search",
            items: [
                {
                    name: "Search",
                    scopes: [],
                    path: "/scanner",
                    icon: 'mdi-magnify'
                }
            ]
        },
        {
            name: "Đơn hàng US",
            items: [
                {
                    name: "Label",
                    path: "/us/labels",
                    icon: 'mdi-barcode',
                    scopes: ["trackingItems"]
                },
                {
                    name: "Xuất file",
                    path: "/us/export",
                    icon: 'mdi-export',
                    scopes: ["trackingItems"]
                },
                {
                    name: "Đăng ký Return/Hold",
                    path: "/us/trackingRegistration",
                    icon: "mdi-registered-trademark",
                    scopes: ["trackingItems"]
                },
                {
                    name: "Nhập hàng",
                    path: "/us/scanDelivery",
                    icon: 'mdi-import',
                    scopes: ["updateTrackingItems"]
                },
                {
                    name: "Đóng lô",
                    path: "/us/lots",
                    icon: "mdi-archive-arrow-down",
                    scopes: ["shipmentList"]
                },
                {
                    name: "DS chuyến bay về",
                    path: "/us/shipments",
                    icon: "mdi-plane-car",
                    scopes: ["shipmentList"]
                },
                {
                    name: "Sản phẩm hỏng",
                    path: "/us/brokenProducts",
                    icon: "mdi-glass-fragile",
                    scopes: ["trackingItems"]
                }
            ]
        },
        {
            name: "Đơn hàng Vietnam",
            items: [
                {
                    name: "Cập nhật thông tin tracking",
                    path: "/vn/updateInfoTracking",
                    icon: "mdi-check",
                    scopes: ["updateTrackingItems"]
                }
                // {
                //     name: "Nhập hàng tại VN",
                //     path: "/vn/shipments",
                //     icon: "mdi-plane-car",
                //     scopes: ["shipmentList"]
                // }
            ]
        },
        {
            name: "Buyer",
            items: [
                {
                    name: "Danh sách buyer chưa được kích hoạt",
                    path: "/buyers/unverifiedBuyer",
                    icon: "mdi-account-supervisor",
                    scopes: ["verifyBuyer"]
                },
                {
                    name: "Danh sách buyer đã được kích hoạt",
                    path: "/buyers/verifiedBuyer",
                    icon: "mdi-account-supervisor",
                    scopes: ["editPackingRequestLeft"]
                }
            ]
        },
        {
            name: "Khách hàng",
            items: [
                {
                    name: "Danh sách khách hàng",
                    path: "/customers/list",
                    icon: "mdi-account-supervisor",
                    scopes: ["customers"],
                },
                {
                    name: "Danh sách tracking theo mã khách hàng",
                    path: "/customers/trackingItems",
                    icon: "mdi-account-supervisor",
                    scopes: ["customers"],
                }
            ]
        },
        {
            name: "Báo cáo",
            items: [
                {
                    name: "Số lượng tracking theo kho",
                    path: "/reports/totalTrackingByWarehouse",
                    icon: "mdi-file-chart",
                    scopes: ["usInventory"]
                },
                {
                    name: "Tracking quá hạn repack",
                    path: "/reports/deliToRepackStock",
                    icon: "mdi-file-chart",
                    scopes: ["usInventory"],
                    notiCount: reportStore.stockCount?.deliToRepackCount ?? 0
                },
                {
                    name: "Tracking quá hạn đóng thùng",
                    path: "/reports/repackToBoxStock",
                    icon: "mdi-file-chart",
                    scopes: ["usInventory"],
                    notiCount: reportStore.stockCount?.repackToBoxCount ?? 0
                },
                {
                    name: "Tracking quá hạn bay về VN",
                    path: "/reports/deliToReceiveAtVN",
                    icon: "mdi-file-chart",
                    scopes: ["usInventory"],
                    notiCount: reportStore.stockCount?.deliToReceiveAtVN ?? 0
                },
                {
                    name: "Thống kê điền thông tin hàng ngày",
                    path: "/reports/infoFillingReport",
                    icon: "mdi-file-chart",
                    scopes: ["usInventory"]
                },
                {
                    name: "Danh sách tracking trong dây",
                    path: "reports/looseChains",
                    icon: "mdi-file-chart",
                    scopes: ["trackingItems"]
                }
            ]
        }
    ]
})

useAsyncData(() => authStore.getUserScopes())

onMounted(() => {
    reportStore.getStockCount()
})

const navSections = computed(() => {
    const checkScopeInclude = (scope: string) => R.includes(scope, authStore.userScopes || '')
    const filterNavItem = (section: NavItem) => !R.includes(false, R.map(checkScopeInclude, section.scopes))
    const filterNavSession = (section: NavSection) => section = R.assoc('items', R.filter(filterNavItem, section.items), section)
    const filterNavSessionNotEmptyFn = (section: NavSection) => !R.isEmpty(section.items)
    return R.filter(filterNavSessionNotEmptyFn, R.map(filterNavSession, allSections.value))
})


</script>