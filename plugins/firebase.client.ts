import { initializeApp } from "firebase/app";
import { CustomParams, EventParams, getAnalytics, logEvent as firebaseLogEvent, setUserId as firebaseSetUserID, setUserProperties as firebaseSetUserProperties  } from "firebase/analytics";

export default defineNuxtPlugin(nuxtApp => {
    const { public: { firebaseApiKey, firebaseAuthDomain, firebaseProjectId, firebaseStorageBucket, firebaseMessagingSenderId, firebaseAppId, firebaseMeasurementId } } = useRuntimeConfig()
    const firebaseConfig = {
        apiKey: firebaseApiKey,
        authDomain: firebaseAuthDomain,
        projectId: firebaseProjectId,
        storageBucket: firebaseStorageBucket,
        messagingSenderId: firebaseMessagingSenderId,
        appId: firebaseAppId,
        measurementId: firebaseMeasurementId
    };

    const firebaseApp = initializeApp(firebaseConfig);
    const analytics = getAnalytics(firebaseApp);

    const fireAnalytics = {
        logEvent: (eventName: string, eventParams?: {
            coupon?: EventParams['coupon'];
            currency?: EventParams['currency'];
            items?: EventParams['items'];
            payment_type?: EventParams['payment_type'];
            value?: EventParams['value'];
            [key: string]: any;
        }) => firebaseLogEvent(analytics, eventName, eventParams),
        setUserProperties: (properties: CustomParams) => firebaseSetUserProperties(analytics, properties),
        screenView: (screenName: string) => firebaseLogEvent(analytics, 'screen_view', {
            firebase_screen: screenName
        }),
        setUserId: (userID: string | null) => firebaseSetUserID(analytics, userID)
    }

    return {
        provide: {
            fireAnalytics
        }
    }
})