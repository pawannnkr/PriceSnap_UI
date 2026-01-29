import React, { useState, useEffect } from 'react';
import PriceHistory from './PriceHistory';
import './ProductCard.css';

export default function ProductCard({ product, onRemove, onUpdateAlert }) {
  const [alertPrice, setAlertPrice] = useState(product.threshold || product.alertPrice || '');
  const [isEditing, setIsEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const currentPrice = product.current_price || product.currentPrice || 0;
  const originalPrice = product.original_price || product.originalPrice || currentPrice;
  const discountPercent = originalPrice > 0 
    ? (((originalPrice - currentPrice) / originalPrice) * 100).toFixed(1)
    : 0;

  const handleUpdateAlert = () => {
    if (alertPrice) {
      onUpdateAlert(product.id, parseFloat(alertPrice));
      setIsEditing(false);
    }
  };

  // Extract title from product - avoid duplicates
  const title = product.title || product.product_title || 'Unknown Product';

  return (
    <div className="product-card">
      {product.image && (
        <img src={product.image} alt={title} className="product-image" onError={(e) => { e.target.style.display = 'none'; }} />
      )}
      <div className="product-info">
        <h3 className="product-title">{title}</h3>
        <p className="product-url">
          <a href={product.url} target="_blank" rel="noopener noreferrer">
            View on Amazon
          </a>
        </p>
        
        <div className="price-section">
          <div className="current-price">
            <span className="label">Current:</span>
            <span className="price">₹{currentPrice.toFixed(2)}</span>
          </div>
          <div className="original-price">
            <span className="label">Original:</span>
            <span className="price">₹{originalPrice.toFixed(2)}</span>
          </div>
          {discountPercent > 0 && (
            <div className="discount">
              <span className="discount-badge">{discountPercent}% OFF</span>
            </div>
          )}
        </div>

        <div className="alert-section">
          {!isEditing ? (
            <div className="alert-display">
              <span className="label">Alert Price:</span>
              <span className="alert-value">
                {alertPrice ? `₹${parseFloat(alertPrice).toFixed(2)}` : 'Not set'}
              </span>
              <button 
                className="btn-edit" 
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
            </div>
          ) : (
            <div className="alert-edit">
              <input
                type="number"
                value={alertPrice}
                onChange={(e) => setAlertPrice(e.target.value)}
                placeholder="Enter alert price (₹)"
                step="0.01"
              />
              <button 
                className="btn-save" 
                onClick={handleUpdateAlert}
              >
                Save
              </button>
              <button 
                className="btn-cancel" 
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <button 
          className="btn-remove" 
          onClick={() => onRemove(product.id)}
        >
          Remove
        </button>

        <button 
          className="btn-history" 
          onClick={() => setShowHistory(!showHistory)}
        >
          {showHistory ? 'Hide History' : 'View History'}
        </button>
      </div>

      {showHistory && (
        <PriceHistory productUrl={product.url} productTitle={title} />
      )}
    </div>
  );
}
