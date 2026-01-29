import axios from 'axios';
import { ENDPOINTS } from '../config';

class APIClient {
  constructor() {
    this.client = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Add a product (expects { url, threshold })
  async addProduct(productData) {
    try {
      const payload = {
        url: productData.url,
        threshold: productData.alertPrice || productData.currentPrice || productData.threshold,
      };
      const response = await this.client.post(ENDPOINTS.ADD_PRODUCT, payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get all tracked products
  async getProducts() {
    try {
      const response = await this.client.get(ENDPOINTS.GET_ALL_TRACKED_PRODUCTS);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Remove a product by id
  async removeProduct(productId) {
    try {
      const url = `${ENDPOINTS.REMOVE_PRODUCT}/${productId}`;
      const response = await this.client.delete(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete a product by URL (DELETE /api/products with body { url })
  async deleteProductByUrl(productUrl) {
    try {
      const payload = { url: productUrl };
      const response = await this.client.delete(ENDPOINTS.REMOVE_PRODUCT, { data: payload });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update per-product alert (assumes endpoint /products/:id/alert)
  async updatePriceAlert(productId, alertData) {
    try {
      // Send threshold instead of alertPrice
      const payload = {
        threshold: alertData.alertPrice || alertData.threshold,
      };
      const url = `${ENDPOINTS.REMOVE_PRODUCT}/${productId}/alert`;
      const response = await this.client.put(url, payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Check a specific product (POST /products/check)
  async checkSpecificProduct(payload) {
    try {
      // payload: { url: "..." }
      const response = await this.client.post(ENDPOINTS.POST_CHECK_SPECIFIC_PRODUCT, payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update all tracked products (bulk update)
  async updateAllTrackedProducts() {
    try {
      // POST /products/update-all with empty payload
      const response = await this.client.post(ENDPOINTS.UPDATE_ALL_TRACKED_PRODUCTS, {});
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get price history for a specific product URL
  // Sends `url` and optional `limit` as query parameters. `limit` is controlled by the UI.
  async getPriceHistory(productUrl, limit = undefined) {
    try {
      const params = { url: productUrl };
      if (limit !== undefined && limit !== null) params.limit = limit;

      const response = await this.client.get(ENDPOINTS.GET_PRICE_HISTORY, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get price stats (status) for a product URL
  async getPriceStats(productUrl) {
    try {
      const response = await this.client.get(ENDPOINTS.GET_PRICE_STATS, {
        params: { url: productUrl },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Notifications
  async getNotifications() {
    try {
      const response = await this.client.get(ENDPOINTS.GET_NOTIFICATIONS);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update notification settings
  // payload: { email: string, phone_number: string }
  async putNotificationStatus(payload) {
    try {
      const response = await this.client.put(ENDPOINTS.PUT_NOTIFICATION_STATUS, payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async sendNotification(payload) {
    try {
      const response = await this.client.post(ENDPOINTS.POST_SEND_NOTIFICATION, payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Trigger check-and-alert flow
  async checkAndAlert(payload) {
    try {
      const response = await this.client.post(ENDPOINTS.POST_CHECK_AND_ALERT, payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get history across all products
  async getHistoryAllProducts(params = {}) {
    try {
      const response = await this.client.get(ENDPOINTS.GET_HISTORY_ALL_PRODUCTS, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete specific product history by URL
  async deleteSpecificProductHistory(productUrl) {
    try {
      const response = await this.client.delete(ENDPOINTS.DELETE_SPECIFIC_PRODUCT_HISTORY, {
        params: { url: productUrl },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      return new Error(error.response.data.message || 'API request failed');
    } else if (error.request) {
      return new Error('No response from server');
    } else {
      return new Error('Error setting up request');
    }
  }
}

export default new APIClient();
