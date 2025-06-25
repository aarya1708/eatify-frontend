import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './profile.css';
import { Link, useNavigate } from 'react-router-dom';
import { useLoading } from "../../context/LoadingContext";
import LoadingIndicator from "../../context/LoadingIndicator";

function Profile() {
  const { startLoading, stopLoading } = useLoading();
  const [userData, setUserData] = useState(null); // Store user details
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalSpending, setTotalSpending] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    startLoading();
    const userType = localStorage.getItem('userType');
    if (userType !== 'customer') {
      navigate('/login');
      stopLoading();
    }
    const userToken = localStorage.getItem('userToken');
    if (!userToken) {
      console.error('No token found');
      navigate('/login');
      stopLoading();
      return;
    }

    try {
      const decodedToken = jwtDecode(userToken);
      // console.log('Decoded token:', decodedToken);

      const userEmail = decodedToken.email;
      if (!userEmail) {
        console.error('No email found in token');
        return;
      }

      axios
        .post("https://eatify-backend.vercel.app/profile", { email: userEmail })
        .then((response) => {
          // console.log('User details received:', response.data);
          setUserData(response.data);

          // Calculate total orders
          const orders = response.data.previousOrders || [];
          setTotalOrders(orders.length);

          // Calculate total spending (sum of totalPrice + deliveryFee)
          const spending = orders.reduce((sum, order) => sum + (order.totalPrice + order.deliveryFee), 0);
          setTotalSpending(spending);
        })
        .catch((error) => {
          console.error("Error fetching profile data:", error.response?.data || error.message);
        });
    } catch (error) {
      console.error('Error decoding token:', error);
    }
    finally {
      stopLoading();
    }
  }, []);

  if (!userData) {
    return <div>Loading profile...</div>;
  }

  return (
    <>
    <LoadingIndicator />
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-image">
          <img src={require('./profile2.jpg')} width="90px" alt="Profile" />
        </div>
        <br /><br /><br />

        <h2 className="profile-name">{userData.name}</h2>
        <p className="profile-location">{userData.address}</p>
        <p className="profile-job">{userData.email}</p>
        <p className="profile-university">{userData.phone}</p>
        <br />

        {/* Stats */}
        <div className="profile-stats">
          <div>
            <span className="stat-number">{totalOrders}</span>
            <p>Total Orders</p>
          </div>
          <div>
            <span className="stat-number">₹{totalSpending}</span>
            <p>Total Spending</p>
          </div>
        </div>
        <br /><br />

        {/* Buttons */}
        <Link to={'/'}><button className="show-more">Home</button></Link>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <Link to="/orders"><button className="show-more">Orders</button></Link>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <Link to={'/login'}><button className="show-more">Logout</button></Link>
      </div>
    </div>
    </>
  );
}

export default Profile;
