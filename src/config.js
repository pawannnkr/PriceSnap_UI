export const API_BASE_URL = 'https://amazon-price-tracker-465920637823.us-central1.run.app/api';

export const ENDPOINTS = {
  ADD_PRODUCT: `${API_BASE_URL}/products`,
  GET_ALL_TRACKED_PRODUCTS: `${API_BASE_URL}/products`,
  REMOVE_PRODUCT: `${API_BASE_URL}/products`,
  GET_PRICE_HISTORY: `${API_BASE_URL}/history/by-url`,
  GET_PRICE_STATS: `${API_BASE_URL}/history/stats/by-url`,
  POST_CHECK_SPECIFIC_PRODUCT: `${API_BASE_URL}/products/check`,
  UPDATE_ALL_TRACKED_PRODUCTS: `${API_BASE_URL}/products/update-all`,
  GET_NOTIFICATIONS: `${API_BASE_URL}/notifications`,
  PUT_NOTIFICATION_STATUS: `${API_BASE_URL}/notifications`,
  POST_SEND_NOTIFICATION: `${API_BASE_URL}/notify`,
  POST_CHECK_AND_ALERT: `${API_BASE_URL}/track/check`,
  GET_HISTORY_ALL_PRODUCTS: `${API_BASE_URL}/history`,
  DELETE_SPECIFIC_PRODUCT_HISTORY: `${API_BASE_URL}/history`,

};

export const STORAGE_KEYS = {
  TRACKED_PRODUCTS: 'trackedProducts',
  USER_PREFERENCES: 'userPreferences',
  PRICE_HISTORY: 'priceHistory',
};
