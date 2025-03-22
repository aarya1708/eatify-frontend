import React, { useRef, useState, useEffect } from 'react';
import './App.css';
import Header from './components/header/header.js';
import Restaurant from './components/customer/restaurants/restaurant.js';
import Food from './components/customer/food/food.js';
import Offers from './components/customer/offers/offers.js';
import Footer from './components/footer/footer.js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useLoading } from "./context/LoadingContext";
import LoadingIndicator from "./context/LoadingIndicator";


function App() {
  const navigate = useNavigate();
  const { isLoading, startLoading, stopLoading } = useLoading();
  const [email, setEmail] = useState(null);
  const [decoded, setDecoded] = useState(null);

  useEffect(() => {
    startLoading();
     const userToken = localStorage.getItem('userToken');
     
     const userType = localStorage.getItem('userType');
     if(userType!=='customer')
     {
      stopLoading();
      navigate('/login');
     }

    if (userToken) {
      try {
        const decodedToken = jwtDecode(userToken); // Decode the token
        console.log('Decoded token:', decodedToken); // Log the decoded token
        setDecoded(decodedToken); // Store decoded token in state

        // You can also extract email from the decoded token if it's there
        setEmail(decodedToken.email || 'No email found'); // Set email if available

        // Make an API call to check authentication
        axios.get('https://eatify-backend.vercel.app/', { withCredentials: true })
          .then((response) => {
            stopLoading();
            console.log("User authenticated:", response.data);
          })
          .catch((error) => {
            stopLoading();
            console.error("Auth check failed, redirecting...");
            navigate('/login', { replace: true }); // Redirect to login if authentication fails
          });
      } catch (error) {
        stopLoading();
        console.error('Error decoding token:', error); // Log error if decoding fails
        navigate('/login', { replace: true }); // Redirect to login if token is invalid or expired
      }
    } else {
      stopLoading();
      console.log('No token found, redirecting...');
      navigate('/login', { replace: true }); // Redirect to login if no token is found
    }
  }, [navigate]);

  const offersRef = useRef(null);

  const scrollToOffers = () => {
    if (offersRef.current) {
      offersRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const [anyToggle, setAnyToggle] = useState({
    pizzaToggle: false,
    pastaToggle: false,
    burgerToggle: false,
    rollsToggle: false,
    shakeToggle: false,
    chineseToggle: false,
  });

  return (
    <>
    {isLoading && <LoadingIndicator />}
      <Header onScrollToOffers={scrollToOffers} />
      <Food anyToggle={anyToggle} setAnyToggle={setAnyToggle} />
      <Restaurant anyToggle={anyToggle} setAnyToggle={setAnyToggle} />
      <Offers ref={offersRef} />
      <Footer />
    </>
  );
}

export default App;
