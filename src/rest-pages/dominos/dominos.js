import React, { useContext, useEffect, useState } from 'react';
import Header from '../../components/header/header2.js';
import '../pizzahut/pizzahut.css';
import { Menuitem } from '../menu_card.js';
import { CartContext } from '../../context/cart-context.js';
import axios from 'axios';

function Dominos() {
    const { cart, setCart } = useContext(CartContext);
    const [restData, setRestData] = useState(null);
    const [menu, setMenu] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);

        axios.post("https://eatify-backend.vercel.app/Domino's%20Pizza", {action:'user', email: "dominos@gmail.com" }) 
            .then((response) => {
                // console.log('Rest details received:', response.data);
                setRestData(response.data);
                setMenu(response.data.menu);
            })
            .catch((error) => {
                console.error("Error fetching profile data:", error.response?.data || error.message);
            });
    }, []); 

    // Log updated menu when it changes
    useEffect(() => {
        if (menu) {
            console.log('Updated menu:', menu);
        }
    }, [menu]);

    return (
        <>
            <Header />
            <div className="menu-container">
                <div className="info-box">
                    <h1>{restData?.name}</h1>
                    <h3 style={{ margin: 0 }}>{restData?.rating} ★ | ₹{restData?.price2person} for two</h3>
                    <h3 style={{ margin: 0, color: 'grey' }}>{restData?.highlights}</h3>
                    <h4>{restData?.deliveryTime}</h4>
                </div>
                <br />
                <div className="top3picks">
                    <h2>Top 3 Picks</h2>
                    <div className="top3imagebox">
                        <img className='top3img' src={require('./1.avif')} />
                        <img className='top3img' src={require('./2.avif')} />
                        <img className='top3img' src={require('./3.avif')} />
                    </div>
                </div>
                <br />
                <div className="menu">
                    <h2>Menu</h2>
                    {Array.isArray(menu) && menu.length > 0 ? (
    menu.map((item) => (
        <Menuitem key={item.name} cart={cart} setCart={setCart} item={item} restaurant="Domino's Pizza" />
    ))
) : (
    <p>Loading menu...</p>
)}


                    <br />
                </div>
            </div>
        </>
    );
}

export default Dominos;
