import React, { useState } from 'react'
import './delivery.css'
import axios from 'axios';        
import { useNavigate } from 'react-router-dom';

const Delivery = () => {
    const [customerSignup, setcustomerSignup] = useState({});
    const navigate = useNavigate();

    const handleSubmitCustomerForm = (e) =>{
        setcustomerSignup({
            ...customerSignup,
            [e.target.name] : e.target.value
        })
    }

    const handleCustomerSignupSubmit = async (e) =>{
        e.preventDefault();
        console.log(customerSignup);
        try {
            await axios.post('https://eatify-backend.vercel.app//signup-as-delivery', {
                name: customerSignup.name,
                email: customerSignup.email,
                phone: Number(customerSignup.phone),
                address: customerSignup.address,
                password: customerSignup.password
            },{withCredentials: true});
            alert("Signup Successfull")
            navigate('/login');
            } catch (error) {
            alert("Email already exists or Invalid phone number");
        }
}

    return (
        <>
            <div className='signup-parent'>
                <div className='signup-detail-box'>
                    <h1 style={{ fontSize: 60 }}>Sign Up as Delivery</h1>
                    <form style={{ display: 'flex', flexDirection: 'column' }}>
                        <input name='name' type='text' placeholder='Full Name' className='login-input-btn' onChange={handleSubmitCustomerForm}></input>
                        <br />
                        <input name='email' type='text' placeholder='Email' className='login-input-btn' onChange={handleSubmitCustomerForm}></input>
                        <br />
                        <input name='phone' type='text' placeholder='Phone Number' className='login-input-btn' onChange={handleSubmitCustomerForm}></input>
                        <br />
                        <textarea
                        className='login-input-btn'
                            name="address"
                            placeholder='Address'
                            rows={4}
                            onChange={handleSubmitCustomerForm}
                        />
                        <br/>
                        <input name='password' type='password' placeholder='Password' className='login-input-btn' onChange={handleSubmitCustomerForm}></input>
                        <br />
                    </form>
                    <button className='signup-submit-btn' type='button' onClick={handleCustomerSignupSubmit}>Sign Up</button>
                </div>
            </div>
        </>
    )
}

export default Delivery