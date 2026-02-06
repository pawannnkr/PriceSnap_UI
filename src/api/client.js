import { API_BASE_URL } from '../config';

class APIClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.timeout = 10000;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Make HTTP requests using native Fetch API
   */
  async request(method, endpoint, data = null, params = null) {
    let url = `${this.baseURL}${endpoint}`;

    // Add query parameters
    if (params && Object.keys(params).length > 0) {
      const queryString = new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== null && value !== undefined) {
            acc[key] = value;
          }
          return acc;
        }, {})
      ).toString();
      url += `?${queryString}`;
    }

    const options = {
      method,
      headers: this.headers,
      timeout: this.timeout,
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || errorData.error || response.statusText);
      }

      const responseData = await response.json().catch(() => null);
      return responseData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==================== USER APIs ====================

  /**
   * 1. Create a new user
   * @param {Object} userData - { email, name }
   */
  async createUser(userData) {
    try {
      return await this.request('POST', '/users', userData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 2. Get all users
   */
  async getAllUsers() {
    try {
      return await this.request('GET', '/users');
    } catch (error) {
      throw error;
    }
  }

  /**
   * 3. Get user by ID
   * @param {number} userId
   */
  async getUserById(userId) {
    try {
      return await this.request('GET', `/users/${userId}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 4. Remove/Delete user
   * @param {number} userId
   */
  async deleteUser(userId) {
    try {
      return await this.request('DELETE', `/users/${userId}`);
    } catch (error) {
      throw error;
    }
  }

  // ==================== PRODUCT APIs ====================

  /**
   * 5. Add a new product
   * @param {Object} productData - { user_id, url, threshold }
   */
  async addProduct(productData) {
    try {
      return await this.request('POST', '/products', productData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 6. Check price for a specific product
   * @param {Object} checkData - { user_id, url }
   */
  async checkProductPrice(checkData) {
    try {
      return await this.request('POST', '/products/check', checkData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 7. Remove/Delete product by ID
   * @param {number} productId
   * @param {number} userId
   */
  async removeProduct(productId, userId) {
    try {
      return await this.request('DELETE', `/products/${productId}`, null, {
        user_id: userId,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * 9. Get all tracked products for a user
   * @param {number} userId
   */
  async getTrackedProducts(userId) {
    try {
      return await this.request('GET', '/products', null, {
        user_id: userId,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * 10. Update prices for all tracked products
   * @param {number} userId
   */
  async updateAllProducts(userId) {
    try {
      return await this.request('POST', '/products/update-all', {}, {
        user_id: userId,
      });
    } catch (error) {
      throw error;
    }
  }

  // ==================== HISTORY APIs ====================

  /**
   * 11. Get product history by URL
   * @param {string} url
   * @param {number} limit - optional limit
   */
  async getProductHistoryByUrl(url, limit = 10) {
    try {
      const params = { url };
      if (limit) params.limit = limit;

      return await this.request('GET', '/history/by-url', null, params);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 12. Get history for all products
   * @param {number} userId
   * @param {number} limit - optional limit
   */
  async getHistoryAllProducts(userId, limit = 10) {
    try {
      return await this.request('GET', '/history', null, {
        user_id: userId,
        limit,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * 13. Delete product history entry
   * @param {number} historyId
   * @param {number} userId
   */
  async deleteProductHistory(historyId, userId) {
    try {
      return await this.request('DELETE', `/history/${historyId}`, null, {
        user_id: userId,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * 14. Get product stats
   * @param {number} productId
   * @param {number} userId
   */
  async getProductStats(productId, userId) {
    try {
      return await this.request('GET', `/history/${productId}/stats`, null, {
        user_id: userId,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * 15. Get product history by ID with optional stats
   * @param {number} userId
   * @param {number} productId
   * @param {number} limit - optional limit
   * @param {boolean} stats - optional stats flag
   */
  async getProductHistoryById(userId, productId, limit = 1, stats = true) {
    try {
      return await this.request('GET', '/history/by-id', null, {
        user_id: userId,
        product_id: productId,
        limit,
        stats,
      });
    } catch (error) {
      throw error;
    }
  }

  // ==================== TRACKING & ALERTS ====================

  /**
   * 16. Check and alert (check all products and trigger alerts if needed)
   */
  async checkAndAlert() {
    try {
      return await this.request('POST', '/track/check');
    } catch (error) {
      throw error;
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Centralized error handler
   */
  handleError(error) {
    if (error instanceof Error) {
      return error;
    }
    return new Error(error.message || 'An unknown error occurred');
  }
}

export default new APIClient();
