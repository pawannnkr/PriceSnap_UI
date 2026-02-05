export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://amazon-price-tracker-465920637823.us-central1.run.app/api';

export const STORAGE_KEYS = {
  TRACKED_PRODUCTS: 'trackedProducts',
  USER_PREFERENCES: 'userPreferences',
  PRICE_HISTORY: 'priceHistory',
  CURRENT_USER_ID: 'currentUserId',
};
