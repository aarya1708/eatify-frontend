import React, { useState } from "react";
import "./header.css";
import { Link, useNavigate } from "react-router-dom";

function Header({ onScrollToOffers }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [restaurants] = useState(["McDonald's", "KFC", "Pizza-Hut", "Subway", "Domino's-pizza", "United-Farmers-Creamery", "Temptations","Kakke-Di-Hatti"]);
    const navigate = useNavigate();

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.trim() === "") {
            setFilteredSuggestions([]);
        } else {
            const matches = restaurants.filter((restaurant) =>
                restaurant.toLowerCase().startsWith(value.toLowerCase())
            );
            setFilteredSuggestions(matches);
        }
    };

    // Handle selecting a suggestion
    const handleSuggestionClick = (restaurant) => {
        const encodedRestaurant = encodeURIComponent(restaurant);
        setSearchTerm(restaurant);
        setFilteredSuggestions([]); // Hide suggestions
        navigate(`/${encodedRestaurant}`);
    };
    

    return (
        <>
            <div className="header">
                <h1 style={{ fontSize: 45 }}>Eatify</h1>

                {/* Search Bar with Suggestions */}
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search restaurants..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="search-input"
                    />
                    <button type="button" className="search-button"><img className="img" src={require("./search.png")} width="20px" alt="Search" />
                    </button>

                    {/* Suggestions List */}
                    {filteredSuggestions.length > 0 && (
                        <ul className="suggestions-list">
                            {filteredSuggestions.map((restaurant, index) => (
                                <li key={index} onClick={() => handleSuggestionClick(restaurant)}>
                                    {restaurant}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="header-links">
                    <a onClick={onScrollToOffers} id="scrl-btn">
                        <img className="img" src={require("./offers.png")} width="30px" alt="Offers" /> Offers
                    </a>
                    <Link to={"/orders"}><img className="img" src={require("./orders.png")} width="30px" alt="Orders" /> Orders</Link>
                    <Link to={"/profile"}><img className="img" src={require("./profile.png")} width="30px" alt="Profile" /> Profile</Link>
                    <Link to={"/cart"}><img className="img" src={require("./cart.png")} width="30px" alt="Cart" /> Cart</Link>
                    <Link to={"/login"}><img className="img" src={require("./logout.png")} width="29px" alt="Logout" /> Logout</Link>
                </div>
            </div>
            <br />
        </>
    );
}

export default Header;
