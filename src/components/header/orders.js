import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './orders.css';
import { jwtDecode } from 'jwt-decode';
import Header2 from './header2.js';
import { useNavigate } from 'react-router-dom';
import { useLoading } from "../../context/LoadingContext";
import LoadingIndicator from "../../context/LoadingIndicator";

const PreviousOrders = () => {
  const { startLoading, stopLoading } = useLoading();
  const [previousOrders, setPreviousOrders] = useState([]);
  const [currentOrders, setCurrentOrders] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    startLoading();
    const userType = localStorage.getItem('userType');
    if (userType !== 'customer') {
      navigate('/login');
      stopLoading();
      return;
    }

    const userToken = localStorage.getItem('userToken');
    if (!userToken) {
      console.error('No token found');
      navigate('/login');
      stopLoading();
      return;
    }

    const decodedToken = jwtDecode(userToken);
    const fetchOrders = async () => {
      try {
        const response = await axios.post('https://eatify-backend.vercel.app//user-prev-order', { email: decodedToken.email });
        let fetchedPreviousOrders = response.data.previousOrders;

        const response2 = await axios.post('https://eatify-backend.vercel.app//user-curr-order', { email: decodedToken.email });
        let fetchedCurrentOrders = response2.data;

        fetchedPreviousOrders.sort((a, b) => b.id - a.id);
        setPreviousOrders(fetchedPreviousOrders);
        setCurrentOrders(fetchedCurrentOrders);
      } catch (err) {
        setError('Failed to fetch orders');
        console.error('Error fetching orders:', err);
      } finally {
        stopLoading();
      }
    };

    fetchOrders();


    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  if (error) return <div className="error">{error}</div>;

  return (
    <>
      <LoadingIndicator />
      <Header2 />
      <div className="previous-orders-container">
        {currentOrders.length > 0 && <h2 className='delivery-h2'>Current Orders</h2>}
        {currentOrders.map((order) => (
          <CurrentOrderCard key={order.id} order={order} />
        ))}

        <h2 className='delivery-h2'>Previous Orders</h2>
        {previousOrders.length > 0 ? (
          previousOrders.map((order) => <PreviousOrderCard key={order.id} order={order} />)
        ) : (
          <p>No previous orders found.</p>
        )}
      </div>

    </>
  );
};

const CurrentOrderCard = ({ order }) => {
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'order yet to be accepted by restaurant':
        return 'status-badge pending';
      case 'order accepted by restaurant':
        return 'status-badge preparing';
      case 'delivery partner assigned':
        return 'status-badge delivery-assigned';
      case "order on it's way to you":
        return 'status-badge out-for-delivery';
      default:
        return 'status-badge';
    }
  };

  return (
    <div className="order-card">  
      <div className="order-header">
        <div className="order-date">Ordered on: {new Date().toLocaleDateString('en-CA')}</div>
        <div className="order-id">Order #{order.id}</div>
      </div>
      <div className="order-details">
        <div className="restaurant-name">{order.restName}</div>
        <div className="order-items">
          {order.orderDetails.map((item, index) => (
            <div key={index} className="order-item">
              <span className="item-name">{item.itemName}</span>&nbsp;&nbsp;&nbsp;
              <span className="item-quantity">(x{item.quantity})</span>
            </div>
          ))}
        </div>
      </div>
      <div className="order-footer">
        <div className="payment-delivery-container">
          <div className="delivery-info">Payment Method: {order.paymentMethod}</div>
          {(order.status.toLowerCase() === "delivery partner assigned" || order.status.toLowerCase() === "order on it's way to you") && (
            <div className="delivery-partner-info">
              <div className="delivery-partner-name">Delivery Partner: {order.deliveryPartner}</div>
              <div className="delivery-partner-phone">Phone: {order.deliveryPartnerContact}</div>
            </div>
          )}

        </div>
        <div className="total-price">Restaurant Total: ₹{order.billTotal - order.deliveryFee}</div>
        <div className="delivery-info">Delivery Fee: ₹{order.deliveryFee}</div>
        <div className="final-total-status">
          <div className="bill-total">Final Total: ₹{order.billTotal}</div>
          <div className={getStatusClass(order.status)}>{order.status}</div>
        </div>
      </div>
    </div>
  );
};


const PreviousOrderCard = ({ order }) => {
  const billTotal = order.totalPrice + order.deliveryFee;
  return (
    <div className="order-card">
      <div className="order-header">
        <div className="order-date">Ordered on: {order.orderDate}</div>
        <div className="order-id">Order #{order.id}</div>
      </div>
      <div className="order-details">
        <div className="restaurant-name">{order.restaurantName}</div>
        <div className="order-items">
          {order.orderDetails.map((item, index) => (
            <div key={index} className="order-item">
              <span className="item-name">{item.itemName}</span>&nbsp;&nbsp;&nbsp;
              <span className="item-quantity">(x{item.quantity})</span>
            </div>
          ))}
        </div>
      </div>
      <div className="order-footer">
        <div className="delivery-info">Payment Method: {order.paymentMethod}</div>
        <div className="total-price">Restaurant Total: ₹{order.totalPrice}</div>
        <div className="delivery-info">Delivery Fee: ₹{order.deliveryFee}</div>
        <div className="bill-total">Final Total: ₹{billTotal}</div>
      </div>
    </div>
  );
};

export default PreviousOrders;
