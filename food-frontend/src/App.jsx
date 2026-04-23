import { useEffect, useState } from "react";
import "./App.css";

const API_BASE_URL = "http://localhost:5000";

function App() {
  const [page, setPage] = useState("auth");
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [foods, setFoods] = useState([]);
  const [foodName, setFoodName] = useState("");
  const [foodPrice, setFoodPrice] = useState("");
  const [foodLoading, setFoodLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  useEffect(() => {
    if (page === "home") {
      fetchFoods();
    }
  }, [page]);

  const fetchFoods = async () => {
    try {
      setFoodLoading(true);
      const response = await fetch(`${API_BASE_URL}/foods`, {
        headers: token ? { Authorization: token } : {}
      });

      if (!response.ok) {
        throw new Error("Failed to load foods");
      }

      const data = await response.json();
      setFoods(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setFoodLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
  };

  const resetFoodForm = () => {
    setFoodName("");
    setFoodPrice("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await fetch(`${API_BASE_URL}/${mode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      if (mode === "register") {
        setMessage("Registered successfully. Please login.");
        setMode("login");
      } else {
        setToken(data.token || "");
        setMessage("Login successful");
        setPage("home");
      }

      resetForm();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const addFood = async (event) => {
    event.preventDefault();

    if (!foodName.trim() || !foodPrice) {
      setError("Please enter food name and price");
      return;
    }

    try {
      setFoodLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/foods`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: token } : {})
        },
        body: JSON.stringify({
          name: foodName.trim(),
          price: Number(foodPrice)
        })
      });

      if (!response.ok) {
        throw new Error("Failed to add food");
      }

      const createdFood = await response.json();
      resetFoodForm();
      setFoods((currentFoods) => [createdFood, ...currentFoods]);
      setMessage("Food saved in Atlas");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setFoodLoading(false);
    }
  };

  const logout = () => {
    setToken("");
    setPage("auth");
    setMessage("Logged out");
    setFoods([]);
    resetFoodForm();
  };

  if (page === "home") {
    return (
      <div className="app-shell">
        <div className="card home-card">
          <p className="eyebrow">Home</p>
          <h1>Add Food</h1>
          <p className="subtitle">A simple page after login to add food items.</p>

          <form onSubmit={addFood} className="auth-form">
            <label>
              Food name
              <input
                type="text"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="Pizza"
              />
            </label>

            <label>
              Price
              <input
                type="number"
                min="0"
                value={foodPrice}
                onChange={(e) => setFoodPrice(e.target.value)}
                placeholder="200"
              />
            </label>

            <button type="submit" disabled={foodLoading} className="primary-btn">
              {foodLoading ? "Saving..." : "Add Food"}
            </button>
          </form>

          {error && <p className="status error">{error}</p>}
          {message && <p className="status success">{message}</p>}

          <div className="home-actions">
            <button type="button" className="secondary-btn" onClick={fetchFoods}>
              Refresh List
            </button>
            <button type="button" className="secondary-btn" onClick={logout}>
              Logout
            </button>
          </div>

          <div className="food-list">
            <h2>Saved Foods</h2>
            {foodLoading ? (
              <p>Loading...</p>
            ) : foods.length === 0 ? (
              <p className="empty-text">No food items yet.</p>
            ) : (
              <ul>
                {foods.map((food) => (
                  <li key={food._id}>
                    {food.name} - Rs. {food.price}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="card auth-card">
        <p className="eyebrow">Simple Auth</p>
        <h1>{mode === "login" ? "Login" : "Register"}</h1>
        <p className="subtitle">A clean form connected to your Node and Mongo backend.</p>

        <div className="mode-switch">
          <button
            type="button"
            className={mode === "login" ? "tab active" : "tab"}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === "register" ? "tab active" : "tab"}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@gmail.com"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="1234"
            />
          </label>

          <button type="submit" disabled={loading} className="primary-btn">
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Register"}
          </button>
        </form>

        {error && <p className="status error">{error}</p>}
        {message && <p className="status success">{message}</p>}

        {token && (
          <div className="token-box">
            <p>Logged in token</p>
            <code>{token}</code>
            <button type="button" className="secondary-btn" onClick={logout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;