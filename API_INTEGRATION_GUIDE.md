# API Integration Guide

All 16 APIs from the curl commands have been integrated into the application. Here's how to use them in your components:

## User APIs

### 1. Create User
```javascript
import apiClient from '../api/client';

const user = await apiClient.createUser({
  email: "user@example.com",
  name: "User Name"
});
```

### 2. Get All Users
```javascript
const users = await apiClient.getAllUsers();
```

### 3. Get User by ID
```javascript
const user = await apiClient.getUserById(userId);
```

### 4. Delete User
```javascript
const result = await apiClient.deleteUser(userId);
```

---

## Product APIs

### 5. Add Product
```javascript
const product = await apiClient.addProduct({
  user_id: 1,
  url: "https://amazon.in/...",
  threshold: 400.0
});
```

### 6. Check Product Price
```javascript
const priceData = await apiClient.checkProductPrice({
  user_id: 1,
  url: "https://amazon.in/..."
});
```

### 7. Remove Product
```javascript
const result = await apiClient.removeProduct(productId, userId);
```

### 9. Get Tracked Products
```javascript
const products = await apiClient.getTrackedProducts(userId);
```

### 10. Update All Products
```javascript
const result = await apiClient.updateAllProducts(userId);
```

---

## History & Stats APIs

### 11. Get Product History by URL
```javascript
const history = await apiClient.getProductHistoryByUrl(
  "https://amazon.in/...",
  limit = 10
);
```

### 12. Get History All Products
```javascript
const allHistory = await apiClient.getHistoryAllProducts(userId, limit = 10);
```

### 13. Delete Product History
```javascript
const result = await apiClient.deleteProductHistory(historyId, userId);
```

### 14. Get Product Stats
```javascript
const stats = await apiClient.getProductStats(productId, userId);
```

### 15. Get Product History by ID (with stats)
```javascript
const historyData = await apiClient.getProductHistoryById(
  userId,
  productId,
  limit = 1,
  stats = true
);
```

---

## Tracking & Alerts

### 16. Check and Alert
```javascript
const result = await apiClient.checkAndAlert();
```

---

## Error Handling

All API methods throw errors with descriptive messages. Use try-catch:

```javascript
try {
  const products = await apiClient.getTrackedProducts(userId);
} catch (error) {
  console.error(error.message);
  // Handle error appropriately
}
```

---

## Base URL

All requests are automatically sent to:
```
https://amazon-price-tracker-465920637823.us-central1.run.app/api
```

This is configured in `src/config.js` under `API_BASE_URL`.

---

## Integration Examples in Components

### Popup.jsx - Loading Products
```javascript
import apiClient from '../api/client';

useEffect(() => {
  const loadProducts = async () => {
    try {
      const products = await apiClient.getTrackedProducts(userId);
      setProducts(products);
    } catch (error) {
      setError(error.message);
    }
  };
  
  loadProducts();
}, [userId]);
```

### PriceHistory.jsx - Loading History
```javascript
useEffect(() => {
  const loadHistory = async () => {
    try {
      const history = await apiClient.getProductHistoryByUrl(url, 10);
      setHistory(history);
    } catch (error) {
      setError(error.message);
    }
  };
  
  loadHistory();
}, [url]);
```

### Adding New Product
```javascript
const handleAddProduct = async (url, threshold) => {
  try {
    const newProduct = await apiClient.addProduct({
      user_id: currentUserId,
      url: url,
      threshold: threshold
    });
    setProducts([...products, newProduct]);
  } catch (error) {
    setError(error.message);
  }
};
```
