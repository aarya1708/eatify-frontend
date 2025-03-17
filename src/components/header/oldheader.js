import React from 'react'
import './header.css'
import { Link } from 'react-router-dom'

function header({ onScrollToOffers }) {
    return (
        <>
            <div className="header">
                <h1 style={{ fontSize: 45 }}>Swiggy</h1>
                <div className='header-links'>

                    <a onClick={onScrollToOffers} id='scrl-btn'><img className='img' src={require('./offers.png')} width="30px" />&nbsp;Offers&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</a>
                    <Link to={'/orders'} style={{textDecoration:'none', color:'black'}}><img className='img' src={require('./orders.png')} width="30px" />&nbsp;Orders&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Link>
                    <Link to={'/profile'} style={{textDecoration:'none', color:'black'}}><img className='img' src={require('./profile.png')} width="30px" />&nbsp;Profile&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Link>
                    <Link to={'/cart'} style={{textDecoration:'none', color:'black'}} ><img className='img' src={require('./cart.png')} width="30px" />&nbsp;Cart&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Link>
                    <Link to={'/login'} style={{textDecoration:'none', color:'black'}}><img className='img' src={require('./logout.png')} width="29px" />&nbsp;Logout&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Link>

                </div>
            </div>
            <br />
        </>
    )
}

export default header