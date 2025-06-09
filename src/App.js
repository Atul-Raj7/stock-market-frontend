// src/App.js
import RealTimeMonitoring from "./RealTimeMonitoring";
import React, { useState, useEffect, useCallback } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  NavLink,
  useNavigate,
} from "react-router-dom";
import "./App.css";

const BACKEND_URL = "https://stock-market-portfolio-6id0.onrender.com";


// Helper function to get users from localStorage or initialize with admin
const getUsers = () => {
  const storedUsers = localStorage.getItem('users');
  if (storedUsers) {
    return JSON.parse(storedUsers);
  }
  // Initialize with admin user if no users exist
  const initialUsers = [{ username: "admin", password: "0000", role: "admin" }];
  localStorage.setItem('users', JSON.stringify(initialUsers));
  return initialUsers;
};

// Login Component
const Login = ({ setIsLoggedIn, setCurrentUser, setUsers }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      setIsLoggedIn(true);
      setCurrentUser(user);
      navigate('/stocks');
      setError('');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="App">
      <h1>Stock Market MERN App - Login</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
};

// User Management Component (accessible only by admin)
const UserManagement = ({ setUsers, currentUser, setCurrentUser }) => { // Added currentUser, setCurrentUser
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('user'); // Default new user role
  const [message, setMessage] = useState('');
  const [currentUsersList, setCurrentUsersList] = useState(getUsers()); // Local state for users list

  // Sync local users list with App's users state
  useEffect(() => {
    setCurrentUsersList(getUsers());
  }, [setUsers]); // Re-fetch when setUsers (which is a stable callback) implies a change in App's users state


  const handleAddUser = (e) => {
    e.preventDefault();
    const users = getUsers();
    if (users.some(u => u.username === newUsername)) {
      setMessage('Username already exists!');
      return;
    }
    const newUser = { username: newUsername, password: newPassword, role: newRole };
    const updatedUsers = [...users, newUser];
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers); // Update state in App
    setCurrentUsersList(updatedUsers); // Update local state
    setMessage('User added successfully!');
    setNewUsername('');
    setNewPassword('');
    setNewRole('user');
  };

  const handleRemoveUser = (usernameToRemove) => {
    if (currentUser.username === usernameToRemove) {
      alert("You cannot remove yourself!");
      return;
    }

    if (window.confirm(`Are you sure you want to remove user: ${usernameToRemove}?`)) {
      const users = getUsers();
      const updatedUsers = users.filter(user => user.username !== usernameToRemove);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers); // Update state in App
      setCurrentUsersList(updatedUsers); // Update local state
      setMessage(`User ${usernameToRemove} removed successfully!`);
    }
  };

  return (
    <div className="App">
      <h1>User Management</h1>
      <h2>Add New User</h2>
      <form onSubmit={handleAddUser}>
        <div>
          <label htmlFor="newUserUsername">Username:</label>
          <input
            type="text"
            id="newUserUsername"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="newUserPassword">Password:</label>
          <input
            type="password"
            id="newUserPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="newUserRole">Role:</label>
          <select id="newUserRole" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit">Add User</button>
        {message && <p>{message}</p>}
      </form>

      <h2>Existing Users</h2>
      <ul>
        {currentUsersList.map(user => (
          <li key={user.username}>
            {user.username} ({user.role})
            {user.role === 'user' && ( // Only show remove button for 'user' role
              <button
                onClick={() => handleRemoveUser(user.username)}
                style={{ marginLeft: '10px', backgroundColor: 'red', color: 'white' }}
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


const Stocks = ({ addToWatchlist }) => {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    // Fetch stock data from the backend
    fetch(`${BACKEND_URL}/api/stocks`)
      .then((res) => res.json())
      .then((data) => setStocks(data))
      .catch((error) => console.error("Error fetching stocks:", error));
  }, []);

  const getRandomColor = () => {
    const colors = ["#FF0000", "#00FF00"]; // Red and Green
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="App">
      <h1>Stock Market MERN App</h1>
      <h2>Stocks</h2>
      <ul>
        {stocks.map((stock) => (
          <li key={stock.symbol}>
            {stock.company} ({stock.symbol}) -
            <span style={{ color: getRandomColor() }}>
              {" "}
              ${stock.initial_price}
            </span>
            <button onClick={() => addToWatchlist(stock)}>
              Add to My Watchlist
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Watchlist = ({ watchlist }) => {
  const getRandomColor = () => {
    const colors = ["#FF0000", "#00FF00"]; // Red and Green
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="App">
      <h1>Stock Market MERN App</h1>
      <h2>My Watchlist</h2>
      <ul>
        {watchlist.map((stock) => (
          <li key={stock.symbol}>
            {stock.company} ({stock.symbol}) -
            <span style={{ color: getRandomColor() }}>
              {" "}
              ${stock.initial_price}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

function App() {
  const [watchlist, setWatchlist] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(!!sessionStorage.getItem('currentUser'));
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = sessionStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [users, setUsers] = useState(getUsers());


  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem('currentUser');
    }
  }, [currentUser]);


  const addToWatchlist = useCallback((stock) => {
    fetch(`${BACKEND_URL}/api/watchlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stock),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        setWatchlist((prevWatchlist) => [...prevWatchlist, stock]);
      })
      .catch((error) =>
        console.error("Error adding to watchlist:", error)
      );
  }, []);

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
        setUsers={setUsers}
      />
    </Router>
  );
}

const AppContent = ({
  isLoggedIn,
  setIsLoggedIn,
  currentUser,
  setCurrentUser,
  watchlist,
  setWatchlist,
  addToWatchlist,
  setUsers
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setWatchlist([]);
    navigate('/login');
  };

  return (
    <>
      <nav>
        {!isLoggedIn && (
          <NavLink to="/login">Login</NavLink>
        )}
        {isLoggedIn && (
          <>
            <NavLink to="/stocks">Stocks</NavLink>
            <NavLink to="/watchlist">Watchlist</NavLink>
            <NavLink to="/real-time-monitoring">Monitoring</NavLink>
            {currentUser && currentUser.role === 'admin' && (
              <NavLink to="/manage-users">Manage Users</NavLink>
            )}
            <button onClick={handleLogout}>Logout</button>
            <span style={{ marginLeft: '10px' }}>
              Welcome, {currentUser ? currentUser.username : 'Guest'}!
            </span>
          </>
        )}
      </nav>
      <Routes>
        <Route
          path="/login"
          element={<Login setIsLoggedIn={setIsLoggedIn} setCurrentUser={setCurrentUser} setUsers={setUsers} />}
        />
        {isLoggedIn ? (
          <>
            <Route
              path="/stocks"
              element={<Stocks addToWatchlist={addToWatchlist} />}
            />
            <Route
              path="/watchlist"
              element={<Watchlist watchlist={watchlist} />}
            />
            <Route
              path="/real-time-monitoring"
              element={<RealTimeMonitoring />}
            />
            {currentUser && currentUser.role === 'admin' && (
              <Route
                path="/manage-users"
                element={<UserManagement setUsers={setUsers} currentUser={currentUser} setCurrentUser={setCurrentUser} />} // Pass currentUser, setCurrentUser
              />
            )}
          </>
        ) : (
          <Route path="*" element={<Login setIsLoggedIn={setIsLoggedIn} setCurrentUser={setCurrentUser} setUsers={setUsers} />} />
        )}
      </Routes>
    </>
  );
};

export default App;