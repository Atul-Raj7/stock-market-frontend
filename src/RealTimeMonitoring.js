// src/RealTimeMonitoring.js
import React, { useState, useEffect } from "react";

const RealTimeMonitoring = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUSStockData = async () => { // Renamed function for clarity
      setLoading(true);
      setError(null);
      try {
        // !!! IMPORTANT: Replace "YOUR_ACTUAL_FMP_API_KEY" with YOUR OWN API KEY from Financial Modeling Prep !!!
        // Sign up at financialmodelingprep.com to get your key.
        // Free plans typically only allow US stock data.
        const API_KEY = "B0oYGeI4VhucITGiHU7AbNj1XHIAdMuk"; // Get this from FMP website after signing up

        // Common US Tech Stock Symbols
        const usStockSymbols = "AAPL,MSFT,GOOGL,AMZN,TSLA"; 
        
        // FMP API endpoint to fetch quotes for multiple symbols
        const url = `https://financialmodelingprep.com/api/v3/quote/${usStockSymbols}?apikey=${API_KEY}`;

        const response = await fetch(url);
        if (!response.ok) {
          // Handle HTTP errors
          const errorData = await response.json();
          throw new Error(`HTTP error! Status: ${response.status} - ${errorData.message || response.statusText}`);
        }
        const data = await response.json();

        // FMP's /quote endpoint returns an array of stock objects.
        // We'll map them to a consistent structure for our display.
        const formattedStocks = data.map(stock => ({
          symbol: stock.symbol,
          company: stock.name,
          price: stock.price,
          previousClose: stock.previousClose, // FMP provides this
        }));
        
        setStocks(formattedStocks);
        
      } catch (e) {
        console.error("Error fetching US stock data:", e);
        // Provide a more specific error message based on common API issues
        if (e.message.includes("401") || e.message.includes("API Key is not valid")) {
          setError("Failed to fetch stock data. API Key invalid or missing. Please check your FMP API Key.");
        } else if (e.message.includes("rate limit")) {
          setError("Failed to fetch stock data. API rate limit exceeded. Please try again later.");
        } else {
          setError(`Failed to fetch stock data: ${e.message}. Please try again later.`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUSStockData();

    // You can set up an interval to refetch this data periodically.
    // Be very mindful of API rate limits if you're on a free tier.
    // For FMP's 250 requests/day, refreshing even every 5 minutes (300 seconds) for 5 stocks
    // can quickly consume your limit if not managed properly.
    // const interval = setInterval(fetchUSStockData, 300000); // Every 5 minutes (300,000 ms)
    // return () => clearInterval(interval);

  }, []); // Empty dependency array ensures this runs once on mount

  const getPriceColor = (currentPrice, previousClosePrice) => {
    // FIX: Changed 'previousPrice' to 'previousClosePrice'
    if (previousClosePrice === undefined || previousClosePrice === null || previousClosePrice === 0) {
        return "#CCCCCC"; // Grey if no valid previous close
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
      <h2>Real-Time Monitoring (US Stocks - Delayed Data from FMP)</h2> {/* Updated Title */}
      {loading && <p>Loading real-time US stock data...</p>}
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
        !loading && !error && <p>No real-time US stock data available. Check your FMP API key and network.</p>
      )}
      <p className="note">
        * This data is typically 15-20 minutes delayed
      </p>
    </div>
  );
};

export default RealTimeMonitoring;