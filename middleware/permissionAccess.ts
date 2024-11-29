import * as R from "ramda";
interface PathScope {
  path: string;
  scopes: string[];
}
const authStore = useAuth();
export default defineNuxtRouteMiddleware( async(to) => {
  const allPathScopes: PathScope[] = [
    {
      path: "/users",
      scopes: ["userList"],
    },
    {
      scopes: ["trackingItems"],
      path: "/scanner",
    },
    {
      scopes: ["agentTracking"],
      path: "/packingRequests"
    },
    {
      scopes: ["agentTracking"],
      path: "/packingRequests/holdStates"
    },
    {
      scopes: ["warehouseList"],
      path: "/warehouse",
    },
    {
      scopes: ["agentList"],
      path: "/agent",
    },
    {
      scopes: ["camera"],
      path: "/packingVideo"
    },
    {
      path: "/trackingItems",
      scopes: ["trackingItems"],
    },
    {
      path: "/trackingReport",
      scopes: ["agentTracking"],
    },
    {
      path: "/trackingReport/details",
      scopes: ["agentTracking"],
    },
    {
      path: "/us/export",
      scopes: ["trackingItems"],
    },
    {
      path: "/us/scanDelivery",
      scopes: ["updateTrackingItems"],
    },
    {
      path: "/us/receivedAtUS",
      scopes: ["deliveryList"],
    },
    {
      path: "/us/repacked",
      scopes: ["packDelivery"],
    },
    {
      path: "/us/boxes",
      scopes: ["packShipment"],
    },
    {
      path: "/us/lots",
      scopes: ["shipmentList"]
    },
    {
      path: "/us/shipments",
      scopes: ["shipmentList"],
    },
    {
      path: "/us/brokenProducts",
      scopes: ["trackingItems"],
    },
    {
      path: "/us/trackingRegistration",
      scopes: ["trackingItems"]
    },
    {
      path: "/vn/updateInfoTracking",
      scopes: ["updateTrackingItems"],
    },
    {
      path: "/vn/shipments",
      scopes: ["shipmentList"],
    },
    {
      path: "/customers/list",
      scopes: ["customers"],
    },
    {
      path: "/customers/trackingItems",
      scopes: ["customers"],
    },
    {
      path: "/reports/totalTrackingByWarehouse",
      scopes: ["usInventory"],
    },
    {
      path: "/buyers/unverifiedBuyer",
      scopes: ["verifyBuyer"],
    },
    {
      path: "/buyers/verifiedBuyer",
      scopes: ["editPackingRequestLeft"],
    },
    {
      path: "us/scanDelivery/warehouse",
      scopes: ["usInventory"],
    },
    {
      path: "/us/labels/products",
      scopes: ["usInventory"],
    },
    {
      path: "/us/labels",
      scopes: ["usInventory"],
    },
    {
      path: "/us/labels/scanned",
      scopes: ["usInventory"],
    },
    {
      path: "/reports/deliToRepackStock",
      scopes: ["usInventory"],
    },
    {
      path: "/reports/repackToBoxStock",
      scopes: ["usInventory"],
    },
    {
      path: "/reports/deliToReceiveAtVN",
      scopes: ["usInventory"],
    },
    {
      path: "/reports/infoFillingReport",
      scopes: ["usInventory"],
    },
    {
      path: "reports/looseChains",
      scopes: ["trackingItems"],
    }
  ];
  console.log(to.path)
const filterFn = (pathScope: PathScope) => R.startsWith(R.prop('path', pathScope), to.path)
  const requiredScopes = R.filter(filterFn, allPathScopes)
console.log(requiredScopes)
  if(R.isEmpty(authStore.userScopes)) {
    await authStore.getUserScopes()
  }
  if (R.isEmpty(requiredScopes)) {
    return navigateTo("/404");
  }
  const pathScope = requiredScopes[0];
  const checkScopeInclude = (scope: string) =>
    R.includes(scope, authStore.userScopes || "");
    
  if (R.includes(false, R.map(checkScopeInclude, pathScope.scopes))) {
    return navigateTo("/404");
  }
});

