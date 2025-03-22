import React, { useState,useEffect } from 'react';
import './restaurant.css';
// import RestData from './rest-data.json';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Restaurant({ anyToggle = {}, setAnyToggle }) {
  const foodIds = {
    pizzaToggle: [1, 2, 4, 6, 7, 8],
    pastaToggle: [1, 2, 6, 7, 8],
    burgerToggle: [2, 3, 4, 5, 6, 8],
    rollsToggle: [2, 3, 4, 5, 6, 8],
    shakeToggle: [2, 3, 4, 5, 6, 7],
    chineseToggle: [1, 2, 3, 4, 5, 7, 8],
  };
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    console.log("Cookies: ", document.cookie);
    axios
      .get("https://eatify-backend.vercel.app/restaurants-auth", { withCredentials: true })  // ✅ Required for auth
      .then((response) => {
        console.log("API Response:", response.data);

        if (Array.isArray(response.data)) {  
          setRestaurants(response.data);  // ✅ Set data if it's an array
        } else {
          console.error("Unexpected response format:", response.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching restaurant data:", error);
      });
}, []);


  // console.log(restaurants); 

  return (
    <>
      <h1 style={{ marginLeft: 100 }}>Top Restaurants</h1>
      <div
        className="rest-parent-cont"
        style={{ width: '100%', justifyContent: 'center', display: 'flex' }}
      >
        <div className="rest-card-container" style={{ display: 'flex', flexWrap: 'wrap' }}>
  {restaurants.map((restaurant) => {
    const routePath = restaurant.name.toLowerCase().replace(/\s+/g, '-');

    return (
      <Link
        key={restaurant.id - 1}
        to={`/${routePath}`} 
        className={`zoom card-links ${
          Object.keys(anyToggle).some(
            (key) => anyToggle[key] && foodIds[key]?.includes(restaurant.id)
          )
            ? 'bnw'
            : ''
        }`}
      >
        <ResCard
          name={restaurant.name}
          rating={restaurant.rating}
          time_to_deliver={restaurant.deliveryTime}
          items={restaurant.highlights}
          image_url={restaurant.photoUrl}
        />
      </Link>
    );
  })}
</div>

      </div>
      <br />
      <br/>
    </>
  );
}

function ResCard({ name, rating, time_to_deliver, items, image_url }) {
  return (
    <div className="card">
      <div className="rest-img">
        <img className="item-img" src={image_url} alt={name} />
      </div>
      <div className="rest-details">
        <h2 style={{ margin: 0, marginLeft: 15, marginTop: 5, marginBottom: 5 }}>{name}</h2>
        <h3 style={{ margin: 0, marginLeft: 15 }}>
          {rating} &#9734; | {time_to_deliver}
        </h3>
        <p style={{ margin: 0, marginLeft: 15, color: 'grey' }}>{items}</p>
      </div>
      <br />
    </div>
  );
}

export default Restaurant;
