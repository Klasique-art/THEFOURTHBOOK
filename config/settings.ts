const isProduction = !__DEV__;

// API URLs
const DEV_API_URL = "http://10.64.43.23:8000/api/v1";
const PROD_API_URL = "http://10.64.43.23:8000/api/v1";
const DEV_PAYMENT_CALLBACK_URL = "thefourthbook://payments/callback";
const PROD_PAYMENT_CALLBACK_URL = "thefourthbook://payments/callback";

export const API_BASE_URL = isProduction ? PROD_API_URL : DEV_API_URL;
export const PAYMENT_CALLBACK_URL = isProduction ? PROD_PAYMENT_CALLBACK_URL : DEV_PAYMENT_CALLBACK_URL;
