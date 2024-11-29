import { TrackingItemOutput, TrackingItemStatus } from '~~/composables/useAPIs/trackings'

export const useCommon = () => ({
    getTrackingPower: (trackingItem: TrackingItemOutput) => {
        var result = 0
        switch (trackingItem.status) {
            case TrackingItemStatus.new:
                result = 0 
                break;
            case TrackingItemStatus.registered:
                result = 1
                break;
            case TrackingItemStatus.receivedAtUSWarehouse:
                result = 2
                break;
            case TrackingItemStatus.repacking:
                result = 3
                break;
            case TrackingItemStatus.repacked:
                result = 4
                break;
            case TrackingItemStatus.boxed:
                result = 5
                break;
            case TrackingItemStatus.flyingBack:
                result = 6
                break;
            case TrackingItemStatus.receivedAtVNWarehouse:
                result = 8
                break;
            default:
                break;
        }
        return result
    }
})