import React from 'react';
import './pizzahut/pizzahut.css';

export function Menuitem({ cart, setCart, item, restaurant }) {
    const cartItem = cart.find(cartItem => cartItem.name === item.name && cartItem.restaurant === restaurant);

    const addToCart = () => {
        if (cart.length > 0 && cart[0].restaurant !== restaurant) {
            alert(`You can only add items from ${cart[0].restaurant}. Please clear your cart first to add items from this restaurant.`);
            return;
        }
        setCart([...cart, { ...item, restaurant, quantity: 1 }]);
    };

    const increaseQuantity = () => {
        setCart(cart.map(cartItem =>
            cartItem.name === item.name ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        ));
    };

    const decreaseQuantity = () => {
        if (cartItem.quantity === 1) {
            setCart(cart.filter(cartItem => cartItem.name !== item.name));
        } else {
            setCart(cart.map(cartItem =>
                cartItem.name === item.name ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem
            ));
        }
    };

    return (
        <>  
            <br />
            <div style={{ display: 'flex' }}>
                <div style={{ height: 150, flexBasis: '80%' }}>
                    {item.veg==="veg"?<img src={require('./veg.png')} width={20} style={{ borderRadius: 1 }} alt="veg-icon" />:<img src={require('./non-veg.png')} width={20} style={{ borderRadius: 1 }} alt="nonveg-icon" />}
                    
                    
                    <h3 style={{ margin: 0 }}>{item.name}</h3>
                    <p>{item.description}</p>
                    <h4 style={{ margin: 0 }}>₹{item.price}</h4>
                </div>
                <div className='img-btn-menu' style={{ width: 150, marginLeft: 10 }}>
                    <img className='menuitem-img' src={item.photoUrl} alt={item.name} />

                    {cartItem ? (
                        <div className="quantity-controls">
                            <button className="quantity-btn" onClick={decreaseQuantity}>-</button>
                            <span>{cartItem.quantity}</span>
                            <button className="quantity-btn" onClick={increaseQuantity}>+</button>
                        </div>
                    ) : (
                        <button className='cart-btn-menu' onClick={addToCart}>
                            Add to Cart
                        </button>
                    )}
                </div>
            </div>
            <hr />
        </>
    );
}

export default Menuitem;
