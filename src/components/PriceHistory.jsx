import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import './PriceHistory.css';

export default function PriceHistory({ productUrl, productTitle }) {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    loadHistory();
  }, [productUrl, limit]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Loading history for URL:', productUrl);

      const data = await apiClient.getPriceHistory(productUrl, limit);

      // Normalize different API shapes: support { entries: [...] } or { history: [...] } or array
      let rawEntries = [];
      if (Array.isArray(data)) {
        rawEntries = data;
      } else if (data && data.entries && Array.isArray(data.entries)) {
        rawEntries = data.entries;
      } else if (data && data.history && Array.isArray(data.history)) {
        rawEntries = data.history;
      } else if (data && data.data && Array.isArray(data.data)) {
        rawEntries = data.data;
      }

      // Map to unified shape: { price, timestamp }
      const historyData = rawEntries.map(item => ({
        price: item.price || item.current_price || item.currentPrice || 0,
        timestamp: item.timestamp || item.date || item.created_at || item.time || null,
        raw: item,
      }));

      console.log('📊 Price history loaded (normalized):', historyData);
      setHistory(historyData);

      // Load stats (try dedicated stats API first)
      console.log('📈 Calling stats API for URL:', productUrl);
      const statsResponse = await apiClient.getPriceStats(productUrl).catch(e => {
        console.warn('Stats API not available or failed:', e.message);
        return null;
      });
      console.log('📈 Raw stats response:', statsResponse);

      // Stats may be nested under `statistics` or top-level fields, or absent
      let statsData = null;
      if (statsResponse) {
        statsData = statsResponse.statistics || statsResponse;
      }

      // If stats not provided by API, compute basic stats from historyData
      if (!statsData) {
        const prices = historyData.map(h => h.price || 0);
        const count = prices.length;
        const sum = prices.reduce((s, v) => s + v, 0);
        const avg = count ? sum / count : 0;
        const min = count ? Math.min(...prices) : 0;
        const max = count ? Math.max(...prices) : 0;
        statsData = {
          average_price: avg,
          current_price: prices[prices.length - 1] || 0,
          first_price: prices[0] || 0,
          highest_price: max,
          lowest_price: min,
          price_change: (prices[prices.length - 1] || 0) - (prices[0] || 0),
          price_change_percent: count && prices[0] ? (((prices[prices.length - 1] || 0) - prices[0]) / prices[0]) * 100 : 0,
          threshold: data && data.threshold ? data.threshold : null,
          title: (data && data.title) || productTitle,
          total_entries: count,
        };
      }

      console.log('📈 Extracted/Computed stats data:', statsData);
      setStats(statsData);
    } catch (err) {
      setError(err.message);
      console.error('❌ Error loading history:', err);
    } finally {
      setLoading(false);
    }
  };

  const parseTimestamp = (ts) => {
    if (!ts) return null;
    try {
      // Truncate fractional seconds beyond milliseconds (some timestamps include microseconds)
      const cleaned = String(ts).replace(/\.(\d{3})\d*/, '.$1');
      const d = new Date(cleaned);
      return isNaN(d.getTime()) ? null : d;
    } catch (e) {
      return null;
    }
  };

  if (loading) return <div className="history-loading">Loading price history...</div>;
  if (error) return <div className="history-error">Error: {error}</div>;

  // Find min and max for chart scaling
  const prices = history.map(h => h.price || h.current_price || 0);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice || 1;

  return (
    <div className="price-history">
      <h4 className="history-title">Price History - {productTitle}</h4>
      
      <div className="debug-info">
        <small>URL: {productUrl}</small>
      </div>

      {stats ? (
        <div className="history-stats">
          <div className="stat-item">
            <span className="stat-label">Min:</span>
            <span className="stat-value">
              ₹{(stats.lowest_price || stats.min_price || stats.minPrice || 0).toFixed(2)}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Max:</span>
            <span className="stat-value">
              ₹{(stats.highest_price || stats.max_price || stats.maxPrice || 0).toFixed(2)}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Avg:</span>
            <span className="stat-value">
              ₹{(stats.average_price || stats.avg_price || stats.avgPrice || 0).toFixed(2)}
            </span>
          </div>
          {stats.price_change_percent && (
            <div className="stat-item">
              <span className="stat-label">Change:</span>
              <span className={`stat-value ${stats.price_change > 0 ? 'up' : 'down'}`}>
                {stats.price_change > 0 ? '▲' : '▼'} {stats.price_change_percent.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="history-stats-loading">Loading stats...</div>
      )}

      <div className="history-controls">
        <label>
          Limit:
          <select value={limit} onChange={(e) => setLimit(parseInt(e.target.value))}>
            <option value={5}>Last 5</option>
            <option value={10}>Last 10</option>
            <option value={15}>Last 15</option>
            <option value={20}>Last 20</option>
          </select>
        </label>
      </div>

      {history.length > 0 ? (
        <div className="history-chart">
          {/* SVG Line Chart */}
          {(() => {
            // Prepare points sorted by date
            const sorted = [...history].sort((a, b) => {
              const da = parseTimestamp(a.timestamp) || new Date(0);
              const db = parseTimestamp(b.timestamp) || new Date(0);
              return da - db;
            });
            const chartWidth = 440;
            const chartHeight = 160;
            const padding = 30;
            const innerWidth = chartWidth - padding * 2;
            const innerHeight = chartHeight - padding * 2;

            const pts = sorted.map((item, i) => {
              const price = item.price || item.current_price || 0;
              const x = padding + (i / Math.max(1, sorted.length - 1)) * innerWidth;
              const y = padding + (1 - (price - minPrice) / range) * innerHeight;
              return { x, y, price, date: parseTimestamp(item.timestamp) };
            });

            const polyPoints = pts.map(p => `${p.x},${p.y}`).join(' ');

            return (
              <svg className="svg-chart" viewBox={`0 0 ${chartWidth} ${chartHeight}`} width="100%" height="180">
                <polyline
                  fill="none"
                  stroke="#0066cc"
                  strokeWidth="2"
                  points={polyPoints}
                />
                {pts.map((p, idx) => (
                  <g key={idx}>
                    <circle cx={p.x} cy={p.y} r={4} fill="#ff9900">
                      <title>{`${p.date ? p.date.toLocaleString() : 'Unknown'}: ₹${p.price.toFixed(2)}`}</title>
                    </circle>
                  </g>
                ))}
                {/* Y axis labels */}
                <text x={6} y={padding} fontSize="10" fill="#666">₹{maxPrice.toFixed(0)}</text>
                <text x={6} y={chartHeight - padding + 4} fontSize="10" fill="#666">₹{minPrice.toFixed(0)}</text>
              </svg>
            );
          })()}
        </div>
      ) : (
        <div className="history-empty">No price history available</div>
      )}

      <div className="history-table">
        <table>
          <thead>
            <tr>
              <th style={{ width: '60%' }}>Date</th>
              <th style={{ width: '40%' }}>Price</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, idx) => {
              const parsedDate = parseTimestamp(item.timestamp);
              return (
                <tr key={idx}>
                  <td>{parsedDate ? parsedDate.toLocaleString() : 'Unknown'}</td>
                  <td style={{ fontWeight: '600', color: '#0066cc' }}>₹{(item.price || item.current_price || 0).toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
