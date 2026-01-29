// Content script to extract product info from Amazon pages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getProductInfo') {
    const productInfo = extractProductInfo();
    sendResponse(productInfo);
  }
});

function extractProductInfo() {
  const url = window.location.href;
  let asin = extractASIN(url);
  
  const titleElement = document.querySelector('h1 span');
  const title = titleElement ? titleElement.textContent : 'Unknown Product';
  
  const priceElement = document.querySelector('span.a-price-whole');
  const currentPrice = priceElement ? parseFloat(priceElement.textContent.replace(/[^0-9.]/g, '')) : 0;
  
  let image = '';
  const imageElement = document.querySelector('img.a-dynamic-image');
  if (imageElement) {
    image = imageElement.src;
  }
  
  return {
    title: title,
    url: url,
    currentPrice: currentPrice,
    originalPrice: currentPrice,
    asin: asin,
    image: image,
    addedAt: new Date().toISOString(),
  };
}

function extractASIN(url) {
  const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/);
  return asinMatch ? asinMatch[1] : '';
}
