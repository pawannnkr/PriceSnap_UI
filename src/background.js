// Background service worker for handling background tasks
// Listen for alarms and check prices periodically
chrome.alarms.create('checkPrices', { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkPrices') {
    checkPrices();
  }
});

async function checkPrices() {
  try {
    // Get all tracked products
    chrome.storage.local.get(['trackedProducts'], async (result) => {
      const products = result.trackedProducts || [];
      
      for (const product of products) {
        // Send notification if price dropped below alert price
        if (product.alertPrice && product.currentPrice <= product.alertPrice) {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: product.image || 'images/icon-128.png',
            title: 'Price Alert!',
            message: `${product.title.substring(0, 50)}... is now $${product.currentPrice}`,
          });
        }
      }
    });
  } catch (error) {
    console.error('Error checking prices:', error);
  }
}

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Amazon Price Tracker installed!');
});
