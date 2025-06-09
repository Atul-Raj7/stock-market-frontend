
// src/RealTimeMonitoring.js
import React, { useState, useEffect } from "react"; // <-- Import useState and useEffect here

const RealTimeMonitoring = () => {
  const [stocks, setStocks] = useState([]); // <-- Initialize stocks state
  const [loading, setLoading] = useState(true); // <-- Initialize loading state
  const [error, setError] = useState(null); // <-- Initialize error state

  useEffect(() => {
    const fetchDelayedIndianStockData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Replace with your chosen API and API Key
        // For demonstration, I'm using a placeholder and assuming FMP structure
        const API_KEY = "B0oYGeI4VhucITGiHU7AbNj1XHIAdMuk"; // Get this from FMP website after signing up
        // IMPORTANT: Replace with a real, valid API endpoint and your API key
        // Example for FMP:
        // const url = `https://financialmodelingprep.com/api/v3/quote/RELIANCE.NSE?apikey=${API_KEY}`;
        // You'll need to fetch multiple stocks or use an endpoint that provides a list.
        // For a list of multiple stocks, FMP might have a /quotes/index endpoint or you fetch them individually.

        // For now, let's use a simulated delayed data for demonstration purposes,
        // similar to what we did before, but with a slight variation to show structure.
        // In a real scenario, this would be your API call.

        const mockDelayedIndianStocks = [
          { symbol: "RELIANCE.NSE", company: "Reliance Industries Ltd.", price: 2900.50, previousClose: 2880.00 },
          { symbol: "TCS.NSE", company: "Tata Consultancy Services", price: 3810.20, previousClose: 3825.50 },
          { symbol: "HDFCBANK.NSE", company: "HDFC Bank Ltd.", price: 1510.00, previousClose: 1505.00 },
          { symbol: "INFY.NSE", company: "Infosys Ltd.", price: 1620.75, previousClose: 1615.20 },
          { symbol: "ICICIBANK.NSE", company: "ICICI Bank Ltd.", price: 1120.00, previousClose: 1110.00 },
        ];
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000)); 

        setStocks(mockDelayedIndianStocks);
        
      } catch (e) {
        console.error("Error fetching delayed stock data:", e);
        setError("Failed to fetch stock data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDelayedIndianStockData();

    // You can set up an interval to refetch this delayed data periodically
    // However, be mindful of API rate limits if you're on a free tier.
    // For FMP's 250 requests/day, refreshing every 5 minutes (300 seconds) for 5 stocks
    // means 60 / 5 * 24 = 288 requests/day if fetching all at once, or 288 * 5 if individual.
    // So, an interval might be too frequent for free tiers without caching.
    // For now, we'll just fetch once on component mount.
    // const interval = setInterval(fetchDelayedIndianStockData, 300000); // Every 5 minutes
    // return () => clearInterval(interval);

  }, []); // Empty dependency array ensures this runs once on mount

  const getPriceColor = (currentPrice, previousClosePrice) => {
    if (previousClosePrice === undefined || previousClosePrice === null) {
        // If no previous close is available, return a neutral color
        return "#FFFFFF";
    }
    if (currentPrice > previousClosePrice) {
      return "#00FF00"; // Green for increase
    } else if (currentPrice < previousClosePrice) {
      return "#FF0000"; // Red for decrease
    } else {
      return "#CCCCCC"; // Grey for no change
    }
  };

  return (
    <div className="App">
      <h1>Stock Market MERN App</h1>
      <h2>Real-Time Monitoring (Indian Stocks - Delayed Data)</h2>
      {loading && <p>Loading real-time stock data...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {!loading && !error && stocks.length > 0 ? (
        <ul>
          {stocks.map((stock) => (
            <li key={stock.symbol}>
              {stock.company} ({stock.symbol}) -{" "}
              <span style={{ color: getPriceColor(stock.price, stock.previousClose) }}>
                ${stock.price.toFixed(2)} 
              </span>
            </li>
          ))}
        </ul>
      ) : (
        !loading && !error && <p>No real-time stock data available. Check your API key and network.</p>
      )}
      <p className="note">
        * This data is simulated/delayed.
      </p>
    </div>
  );
};

export default RealTimeMonitoring;



