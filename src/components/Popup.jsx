import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import ProductCard from './ProductCard';
import NotificationSettings from './NotificationSettings';
import './Popup.css';

export default function Popup() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentProduct, setCurrentProduct] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getProducts();
      // Map API response to UI format
      const mappedProducts = Array.isArray(data) ? data : (data.products || []);
      const formattedProducts = mappedProducts.map(product => ({
        id: product.id || product.url,
        title: product.title || 'Unknown Product',
        url: product.url,
        currentPrice: product.current_price || product.currentPrice || 0,
        originalPrice: product.original_price || product.originalPrice || product.current_price || 0,
        image: product.image || product.image_url || '',
        alertPrice: product.threshold || product.alertPrice || 0,
        threshold: product.threshold,
        ...product,
      }));
      setProducts(formattedProducts);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCurrentProduct = async () => {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const tab = tabs[0];
        
        // Extract Amazon product URL and ASIN
        if (tab.url.includes('amazon.com') || tab.url.includes('amazon.in')) {
          // Inject content script to extract product info
          chrome.tabs.sendMessage(tab.id, { action: 'getProductInfo' }, (response) => {
            if (response) {
              submitProduct(response);
            }
          });
        } else {
          setError('Please navigate to an Amazon product page');
        }
      });
    } catch (err) {
      setError('Error adding product: ' + err.message);
    }
  };

  const submitProduct = async (productData) => {
    try {
      const result = await apiClient.addProduct(productData);
      const newProduct = {
        id: result.id || productData.url,
        title: productData.title || 'Unknown Product',
        url: productData.url,
        currentPrice: result.current_price || productData.currentPrice || 0,
        originalPrice: result.original_price || productData.originalPrice || 0,
        image: result.image || productData.image || '',
        alertPrice: result.threshold || productData.alertPrice || 0,
        threshold: result.threshold,
        ...result,
      };
      setProducts([...products, newProduct]);
      setError(null);
    } catch (err) {
      setError('Error saving product: ' + err.message);
    }
  };

  const handleRemoveProduct = async (productId) => {
    try {
      const product = products.find(p => p.id === productId);
      if (product && product.url) {
        await apiClient.deleteProductByUrl(product.url);
      } else {
        await apiClient.removeProduct(productId);
      }
      setProducts(products.filter(p => p.id !== productId));
      setError(null);
    } catch (err) {
      setError('Error removing product: ' + err.message);
      console.error('Remove error:', err);
    }
  };

  const handleUpdateAlert = async (productId, alertPrice) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      // Update threshold in DB by calling addProduct API with new threshold
      await apiClient.addProduct({
        url: product.url,
        threshold: alertPrice,
      });

      // Update UI
      const updatedProducts = products.map(p => 
        p.id === productId ? { ...p, alertPrice, threshold: alertPrice } : p
      );
      setProducts(updatedProducts);
      setError(null);
    } catch (err) {
      setError('Error updating alert: ' + err.message);
      console.error('Update alert error:', err);
    }
  };

  return (
    <div className="popup-container">
      <div className="popup-header">
        <h1>Amazon Price Tracker</h1>
        <button className="btn-add-current" onClick={handleAddCurrentProduct}>
          + Add Current Product
        </button>
      </div>

      <NotificationSettings />

      {error && (
        <div className="error-message">
          <strong>⚠️ Error:</strong> {error}
        </div>
      )}

      {loading && (
        <div className="loading">Loading your tracked products...</div>
      )}

      {!loading && products.length === 0 && (
        <div className="empty-state">
          <p>No products being tracked yet.</p>
          <p>Visit an Amazon product page and click "Add Current Product"</p>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="products-list">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onRemove={handleRemoveProduct}
              onUpdateAlert={handleUpdateAlert}
            />
          ))}
        </div>
      )}
    </div>
  );
}
