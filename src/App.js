import React, { useState, useEffect, useCallback } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  NavLink,
  useNavigate,
} from "react-router-dom";
import "./App.css";
import RealTimeMonitoring from "./RealTimeMonitoring";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const BACKEND_URL = "https://stock-market-portfolio-6id0.onrender.com";

// --- Local Storage Helper Functions for User Watchlists ---

// Gets all user watchlists from localStorage
const getAllUserWatchlists = () => {
  try {
    const stored = localStorage.getItem("userWatchlists");
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error("Error parsing user watchlists from localStorage:", error);
    return {};
  }
};

// Saves all user watchlists to localStorage
const saveAllUserWatchlists = (allWatchlists) => {
  try {
    localStorage.setItem("userWatchlists", JSON.stringify(allWatchlists));
  } catch (error) {
    console.error("Error saving user watchlists to localStorage:", error);
  }
};

// Gets a specific user's watchlist
const getUserWatchlist = (username) => {
  const allWatchlists = getAllUserWatchlists();
  return allWatchlists[username] || [];
};

// Saves a specific user's watchlist
const saveUserWatchlist = (username, watchlist) => {
  const allWatchlists = getAllUserWatchlists();
  allWatchlists[username] = watchlist;
  saveAllUserWatchlists(allWatchlists);
};

// --- End Local Storage Helper Functions ---


// Get users from localStorage or initialize with admin
const getUsers = () => {
  const storedUsers = localStorage.getItem("users");
  if (storedUsers) return JSON.parse(storedUsers);
  const initialUsers = [{ username: "admin", password: "0000", role: "admin" }];
  localStorage.setItem("users", JSON.stringify(initialUsers));
  return initialUsers;
};

// Login Component (MODIFIED)
const Login = ({ setIsLoggedIn, setCurrentUser, setUsers }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    const users = getUsers();
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      setIsLoggedIn(true);
      setCurrentUser(user);
      navigate("/dashboard"); // --- CHANGED: Redirect to Dashboard after login ---
      setError("");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="App">
      <div className="logo-wrapper">
        <img
          src="https://cdn-icons-png.flaticon.com/512/564/564398.png"
          alt="StAMP Services Logo"
          className="logo-image"
        />
      </div>
      <form onSubmit={handleLogin}>
        <div>
          <label>Username:</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
};

// User Management Component
const UserManagement = ({ setUsers, currentUser }) => {
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("user");
  const [message, setMessage] = useState("");
  const [currentUsersList, setCurrentUsersList] = useState(getUsers());

  useEffect(() => {
    setCurrentUsersList(getUsers());
  }, [setUsers]);

  const handleAddUser = (e) => {
    e.preventDefault();
    const users = getUsers();
    if (users.some((u) => u.username === newUsername)) {
      setMessage("Username already exists!");
      return;
    }
    const newUser = {
      username: newUsername,
      password: newPassword,
      role: newRole,
    };
    const updatedUsers = [...users, newUser];
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    setCurrentUsersList(updatedUsers);
    setMessage("User added successfully!");
    setNewUsername("");
    setNewPassword("");
    setNewRole("user");
  };

  const handleRemoveUser = (usernameToRemove) => {
    if (currentUser.username === usernameToRemove) {
      alert("You cannot remove yourself!");
      return;
    }

    if (
      window.confirm(`Are you sure you want to remove user: ${usernameToRemove}?`)
    ) {
      const users = getUsers();
      const updatedUsers = users.filter(
        (user) => user.username !== usernameToRemove
      );
      localStorage.setItem("users", JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      setCurrentUsersList(updatedUsers);
      // Also remove their watchlist from localStorage
      const allWatchlists = getAllUserWatchlists();
      delete allWatchlists[usernameToRemove];
      saveAllUserWatchlists(allWatchlists);

      setMessage(`User ${usernameToRemove} removed successfully!`);
    }
  };

  return (
    <div className="App">
      <h1>User Management</h1>
      <form onSubmit={handleAddUser}>
        <input
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">Add User</button>
        {message && <p>{message}</p>}
      </form>
      <ul>
        {currentUsersList.map((user) => (
          <li key={user.username}>
            {user.username} ({user.role})
            {user.role === "user" && (
              <button
                onClick={() => handleRemoveUser(user.username)}
                style={{ marginLeft: "10px" }}
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

// Stocks List Component
const Stocks = ({ addToWatchlist }) => {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/stocks`)
      .then((res) => res.json())
      .then((data) => setStocks(data))
      .catch((error) => console.error("Error fetching stocks:", error));
  }, []);

  return (
    <div className="App">
      <h2>Stocks</h2>
      <ul>
        {stocks.map((stock) => (
          <li key={stock.symbol}>
            {stock.company} ({stock.symbol}) -{" "}
            <span style={{ color: "gray" }}>${stock.initial_price}</span>
            <button onClick={() => addToWatchlist(stock)} style={{ marginLeft: 10 }}>
              Add to Watchlist
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Watchlist Component
const Watchlist = ({ watchlist, deleteFromWatchlist, livePrices }) => {
  return (
    <div className="App">
      <h2>My Watchlist</h2>
      <ul>
        {watchlist.map((stock) => {
          const initialPrice = parseFloat(stock.initial_price);
          const currentPrice = livePrices[stock.symbol] || initialPrice;
          const profitLoss = (currentPrice - initialPrice).toFixed(2);
          const color = profitLoss >= 0 ? "green" : "red";

          return (
            <li key={stock.symbol}>
              {stock.company} ({stock.symbol}) -{" "}
              <span style={{ color, fontWeight: 'bold' }}>
                ${currentPrice.toFixed(2)}{" "}
                ({profitLoss >= 0 ? "+" : ""}{profitLoss})
              </span>
              <button
                onClick={() => deleteFromWatchlist(stock.symbol)}
                style={{ marginLeft: "10px" }}
              >
                Delete
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

// Dashboard Component
const Dashboard = ({ watchlist, livePrices }) => {
  const stockEarnings = watchlist.map((stock) => {
    const initialPrice = parseFloat(stock.initial_price);
    const currentPrice = livePrices[stock.symbol] || initialPrice;
    return currentPrice - initialPrice;
  });

  const totalEarnings = stockEarnings.reduce((sum, earning) => sum + earning, 0);

  const chartData = {
    labels: watchlist.map((stock) => stock.symbol),
    datasets: [
      {
        label: "Profit/Loss ($)",
        data: stockEarnings,
        fill: false,
        borderColor: (context) => {
          const value = context.dataset.data[context.dataIndex];
          return value >= 0 ? "green" : "red";
        },
        tension: 0.2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Profit/Loss ($)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Stock Symbol'
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += `$${context.parsed.y.toFixed(2)}`;
            }
            return label;
          }
        }
      },
      legend: {
        display: true,
        position: 'top',
      }
    }
  };

  return (
    <div className="App">
      <h2>Dashboard</h2>
      <p>Total Profit/Loss: <span style={{ color: totalEarnings >= 0 ? 'green' : 'red', fontWeight: 'bold' }}>${totalEarnings.toFixed(2)}</span></p>
      <div style={{ maxWidth: "700px", margin: "auto" }}>
        {watchlist.length > 0 ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <p>Add stocks to your watchlist to see dashboard data.</p>
        )}
      </div>
    </div>
  );
};

// App Wrapper Component
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!sessionStorage.getItem("currentUser")
  );
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = sessionStorage.getItem("currentUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [users, setUsers] = useState(getUsers());

  // Watchlist state, initialized based on currentUser
  const [watchlist, setWatchlist] = useState(() => {
    return currentUser ? getUserWatchlist(currentUser.username) : [];
  });

  // Live prices state
  const [livePrices, setLivePrices] = useState({});

  // Effect to manage currentUser in sessionStorage and load watchlist on login
  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
      // Load the current user's watchlist when currentUser changes
      setWatchlist(getUserWatchlist(currentUser.username));
    } else {
      sessionStorage.removeItem("currentUser");
      // Clear watchlist and live prices on logout
      setWatchlist([]);
      setLivePrices({});
    }
  }, [currentUser]);

  // Effect to simulate real-time price updates for watchlist stocks
  useEffect(() => {
    if (watchlist.length === 0) {
      setLivePrices({}); // Clear live prices if watchlist is empty
      return;
    }

    const interval = setInterval(() => {
      setLivePrices(prevPrices => {
        const newPrices = { ...prevPrices };
        watchlist.forEach(stock => {
          const initial = parseFloat(stock.initial_price);
          const fluctuation = (Math.random() * 0.1 - 0.05) * initial; // +/- 5% of initial price
          let newPrice = (prevPrices[stock.symbol] || initial) + fluctuation;

          newPrice = Math.max(newPrice, initial * 0.01, 0.1); // Ensure price doesn't go too low

          newPrices[stock.symbol] = parseFloat(newPrice.toFixed(2));
        });
        return newPrices;
      });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [watchlist]);

  // Add stock to watchlist (account-specific)
  const addToWatchlist = useCallback((stock) => {
    if (!currentUser) {
      console.warn("Cannot add to watchlist: No user logged in.");
      return;
    }
    setWatchlist((prev) => {
      if (prev.some((s) => s.symbol === stock.symbol)) {
        return prev; // Stock already in watchlist
      }
      const newWatchlist = [...prev, stock];
      saveUserWatchlist(currentUser.username, newWatchlist); // Save to localStorage
      return newWatchlist;
    });
  }, [currentUser]);

  // Delete stock from watchlist (account-specific)
  const deleteFromWatchlist = useCallback((symbol) => {
    if (!currentUser) {
      console.warn("Cannot delete from watchlist: No user logged in.");
      return;
    }
    setWatchlist((prev) => {
      const newWatchlist = prev.filter((stock) => stock.symbol !== symbol);
      saveUserWatchlist(currentUser.username, newWatchlist); // Save to localStorage
      return newWatchlist;
    });
    // Also remove from livePrices when deleted from watchlist
    setLivePrices(prevPrices => {
        const updatedPrices = { ...prevPrices };
        delete updatedPrices[symbol];
        return updatedPrices;
    });
  }, [currentUser]);

  return (
    <Router>
      <AppContent
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        watchlist={watchlist}
        setWatchlist={setWatchlist}
        addToWatchlist={addToWatchlist}
        deleteFromWatchlist={deleteFromWatchlist}
        setUsers={setUsers}
        livePrices={livePrices}
      />
    </Router>
  );
}

// Navigation + Routes Component (MODIFIED)
const AppContent = ({
  isLoggedIn,
  setIsLoggedIn,
  currentUser,
  setCurrentUser,
  watchlist,
  setWatchlist,
  addToWatchlist,
  deleteFromWatchlist,
  setUsers,
  livePrices,
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setWatchlist([]); // Clear the current watchlist state
    navigate("/login");
  };

  return (
    <>
      <nav>
        {!isLoggedIn && <NavLink to="/login">Login</NavLink>}
        {isLoggedIn && (
          <>
            <NavLink to="/stocks">Stocks</NavLink>
            <NavLink to="/watchlist">Watchlist</NavLink>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/real-time-monitoring">Monitoring</NavLink>
            {currentUser?.role === "admin" && (
              <NavLink to="/manage-users">Manage Users</NavLink>
            )}
            <button onClick={handleLogout}>Logout</button>
            <span>Welcome, {currentUser?.username}!</span>
          </>
        )}
      </nav>
      <Routes>
        <Route
          path="/login"
          element={
            <Login
              setIsLoggedIn={setIsLoggedIn}
              setCurrentUser={setCurrentUser}
              setUsers={setUsers}
            />
          }
        />
        {isLoggedIn ? (
          <>
            <Route
              path="/stocks"
              element={<Stocks addToWatchlist={addToWatchlist} />}
            />
            <Route
              path="/watchlist"
              element={
                <Watchlist
                  watchlist={watchlist}
                  deleteFromWatchlist={deleteFromWatchlist}
                  livePrices={livePrices}
                />
              }
            />
            <Route
              path="/dashboard"
              element={<Dashboard watchlist={watchlist} livePrices={livePrices} />}
            />
            <Route path="/real-time-monitoring" element={<RealTimeMonitoring />} />
            {currentUser?.role === "admin" && (
              <Route
                path="/manage-users"
                element={
                  <UserManagement setUsers={setUsers} currentUser={currentUser} />
                }
              />
            )}
            {/* --- CHANGED: Dashboard is now the default landing page for logged-in users --- */}
            <Route path="*" element={<Dashboard watchlist={watchlist} livePrices={livePrices} />} />
          </>
        ) : (
          <Route
            path="*"
            element={
              <Login
                setIsLoggedIn={setIsLoggedIn}
                setCurrentUser={setCurrentUser}
                setUsers={setUsers}
              />
            }
          />
        )}
      </Routes>
    </>
  );
};

export default App;