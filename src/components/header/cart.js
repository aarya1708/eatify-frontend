import React, { useContext, useState, useEffect } from 'react';
import { CartContext } from '../../context/cart-context.js';
import './cart.css';
import axios from 'axios';
import Header2 from './header2.js';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jwtDecode } from 'jwt-decode';
import { useLoading } from "../../context/LoadingContext";
import LoadingIndicator from "../../context/LoadingIndicator";

function Cart() {
  const { startLoading, stopLoading } = useLoading();
  const { cart, setCart } = useContext(CartContext);
  const restaurantName = cart[0]?.restaurant;
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const customerName = localStorage.getItem('name');

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryFee = Math.floor(totalPrice * 0.1);
  const finalTotal = totalPrice + deliveryFee;



  const handleCartCheckOut = async (paymentMethod) => {
    if (!cart || cart.length === 0) {
      toast.warn('Cart is empty!');
      return;
    }

    startLoading();
    const userToken = localStorage.getItem('userToken');
    const decodedToken = jwtDecode(userToken);

    const orderPayload = {
      id: Date.now(),
      customerName,
      customerEmail: decodedToken.email,
      restaurantName,
      orderDetails: cart.map((item) => ({
        itemName: item.name,
        quantity: item.quantity,
      })),
      totalQuantity,
      totalPrice: totalPrice,
      deliveryFee: deliveryFee,
      finalTotal: finalTotal,
      paymentMethod: paymentMethod,
    };

    if (paymentMethod === "COD") {
      try {
        await axios.post('https://eatify-backend.vercel.app//cart', orderPayload, {
          headers: { 'Content-Type': 'application/json' },
        });

        toast.success('Order placed successfully! Pay on delivery.');
        setCart([]);
        stopLoading();
      } catch (error) {
        toast.error('Error placing COD order!');
        console.error('COD Error:', error.response ? error.response.data : error.message);
      }

    } else {
      try {
        const orderResponse = await axios.post(
          'https://eatify-backend.vercel.app//create-order',
          { amount: finalTotal * 100 } // Razorpay accepts amount in paise
        );

        const options = {
          key: 'rzp_test_ahGqOYJn2Nr33O', // Replace with Razorpay API Key
          amount: finalTotal * 100,
          currency: 'INR',
          name: 'Eatify',
          description: 'Food Order Payment',
          order_id: orderResponse.data.id,
          handler: async function (response) {
            const verifyResponse = await axios.post(
              'https://eatify-backend.vercel.app//verify-payment',
              response
            );

            if (verifyResponse.data.success) {
              await axios.post('https://eatify-backend.vercel.app//cart', orderPayload, {
                headers: { 'Content-Type': 'application/json' },
              });

              toast.success('Payment successful! Order placed successfully!');
              setCart([]);
            } else {
              toast.error('Payment verification failed!');
            }
          },
          prefill: {
            name: customerName,
            email: decodedToken.email,
            contact: '9426358505',
          },
          theme: { color: '#3399cc' },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        stopLoading();
      } catch (error) {
        toast.error('Error during checkout!');
        console.error('Error:', error.response ? error.response.data : error.message);
      }
      
    }
    navigate('/orders');
  };


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

    const fetchRestaurantDetails = async () => {
      try {
        const response = await axios.get('https://eatify-backend.vercel.app//cart', {
          params: { name: restaurantName },
        });
        setRestaurant(response.data);
        stopLoading();
      } catch (error) {
        toast.error('Failed to fetch restaurant details');
        console.error('Error fetching restaurant:', error);
      }
    };

    fetchRestaurantDetails();
  }, [restaurantName, navigate]);

  if (!restaurantName) {
    stopLoading();
    return (
      <>
        <Header2 />
        <div className="cart-parent">
          <div className="cart-empty-state">
            <h1>Your Cart is Empty</h1>
          </div>
        </div>
        <ToastContainer />
      </>
    );
  }

  if (!restaurant) {
    return (
      <>
      <ToastContainer />
        <LoadingIndicator />
        <Header2 />
        <div className="cart-parent">
          <div className="cart-empty-state">
            <h1>Your Cart is Empty</h1>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
    <ToastContainer
      position="top-right"
      autoClose={1250}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      style={{ top: '120px', right: '50px', zIndex: 9999  }}
    />
      <LoadingIndicator />
      <Header2 />
      <div className="cart-parent">
        <div className="cart-child">
          <h1>Cart</h1>
          <hr />
          <br />
          <div className="cart-restaurant-info">
            <h2>{restaurant.name}</h2>
            <h3>{restaurant.address}</h3>
          </div>
          {cart.map((item, index) => (
            <CartItem key={index} item={item} cart={cart} setCart={setCart} />
          ))}
          <div className="cart-total">
            <h3>Total Quantity: {totalQuantity}</h3>
            <div className="total-summary">
              <h3>Total Price:</h3> <span>₹{totalPrice}</span>
            </div>
            <div className="total-summary">
              <h3>Delivery Fee:</h3> <span>₹{deliveryFee}</span>
            </div>
            <h2 className="final-total">
              Grand Total: ₹{finalTotal}
            </h2>
          </div>
        </div>

        <div className="cart-buttons">
          <button className="cart-checkout-button cod-button" onClick={() => handleCartCheckOut("COD")}>
            Cash on Delivery
          </button>
          <button className="cart-checkout-button online-button" onClick={() => handleCartCheckOut("Online")}>
            Pay Online
          </button>
        </div>


      </div>


    </>
  );
}

const CartItem = ({ item, cart, setCart }) => {
  const increaseQuantity = () => {
    setCart(
      cart.map((cartItem) =>
        cartItem.name === item.name
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      )
    );
  };

  const decreaseQuantity = () => {
    if (item.quantity === 1) {
      setCart(cart.filter((cartItem) => cartItem.name !== item.name));
    } else {
      setCart(
        cart.map((cartItem) =>
          cartItem.name === item.name
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        )
      );
    }
  };

  return (
    <>
      <LoadingIndicator />
      <div className="cart-item">
        <div className="cart-item-name">{item.name}</div>
        <div className="cart-item-quantity">
          <button onClick={decreaseQuantity}>-</button>
          <span>{item.quantity}</span>
          <button onClick={increaseQuantity}>+</button>
        </div>
        <div className="cart-item-price">
          ₹{(item.price * item.quantity)}
        </div>
      </div>
    </>
  );
};

export default Cart;
