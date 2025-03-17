import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { CartProvider } from './context/cart-context.js';
import { PrevOrderProvider } from './context/prevOrder-context.js';
import { LoadingProvider } from "./context/LoadingContext.js";


import Pizzahut from './rest-pages/pizzahut/pizzahut.js'
import Mcd from './rest-pages/mcd/mcd.js'
import Dominos from './rest-pages/dominos/dominos.js'
import Kfc from './rest-pages/kfc/kfc.js'
import Subway from './rest-pages/subway/subway.js'
import Kakkedihatti from './rest-pages/kdh/kakke-di-hatti.js'
import Ufc from './rest-pages/ufc/ufc.js'
import Temptations from './rest-pages/temptations/temptations.js'
import Login from './components/login/login.js'
import Customer from './components/signup/customer.js'
import Delivery from './components/signup/delivery.js'
import Deliver from './components/delivery/delivery.jsx'
import Menu from './components/restaurant/Menu.jsx'
import Account from './components/restaurant/Account.jsx'
import Order from './components/restaurant/Order.jsx'
import Cart from './components/header/cart.js'
import Profile from './components/header/profile.js'
import Orders from './components/header/orders.js'

const root = ReactDOM.createRoot(document.getElementById('root'));
let allRoutes = createBrowserRouter(
  [
    {
      path: '/',
      element: <App />
    },
    {
      path: 'pizza-hut',
      element: <Pizzahut />
    },
    {
      path: `mcdonald's`,
      element: <Mcd />
    },
    {
      path: 'kfc',
      element: <Kfc />
    },
    {
      path: "domino's-pizza",
      element: <Dominos />
    },
    {
      path: 'kakke-di-hatti',
      element: <Kakkedihatti />
    },
    {
      path: 'united-farmers-creamery',
      element: <Ufc />
    },
    {
      path: 'temptations',
      element: <Temptations />
    },
    {
      path: 'subway',
      element: <Subway />
    },
    {
      path: 'login',
      element: <Login />
    },
    {
      path: 'signup-as-customer',
      element: <Customer />
    },
    {
      path: 'signup-as-delivery',
      element: <Delivery />
    },
    {
      path: 'delivery',
      element: <Deliver />
    },
    {
      path: 'rest-order',
      element: <Order />
    },
    {
      path: 'rest-acc',
      element: <Account />
    },
    {
      path: 'rest-menu',
      element: <Menu />
    },
    {
      path: 'cart',
      element: <Cart />
    },
    {
      path: 'profile',
      element: <Profile />
    },
    {
      path: 'orders',
      element: <Orders />
    }
  ]
)

root.render(
  <React.StrictMode>
    <LoadingProvider>
      <CartProvider>
        <PrevOrderProvider>
          <RouterProvider router={allRoutes} />
        </PrevOrderProvider>
      </CartProvider>
    </LoadingProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
