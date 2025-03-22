import React, { useEffect, useState } from 'react';
import './login.css';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
    const [loginForm, setLoginForm] = useState({
        email: "",
        password: ""
    });

    useEffect(() => {
        console.log('Clearing localStorage and cookies');
        localStorage.clear();

 
        document.cookie.split(";").forEach((cookie) => {
            const [name] = cookie.split("=");
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
        });
    }, []);
    const navigate = useNavigate();
    
    const handleLoginForm = (e) => {
        setLoginForm({
            ...loginForm,
            [e.target.name]: e.target.value
        });
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://eatify-backend-bi1r9dsy5-aaryas-projects-e3d58f8e.vercel.app/login', {
                email: loginForm.email,
                password: loginForm.password
            },{ withCredentials: true });
            console.log(response.data);
            const { token, userType, userName } = response.data;
            const userToken = token;
            localStorage.setItem('userToken', userToken);
            localStorage.setItem('name', userName);
            localStorage.setItem('userType', userType);

            if (userType === "customer") {
                navigate('/');
            } else if (userType === "restaurant") {
                navigate('/rest-menu');
            } else if (userType === "delivery-partner") {
                navigate('/delivery');
            }
                else {
                navigate('/');
        }
     }catch (error) {
            alert("Invalid Credentials");
            setLoginForm({
                email: "",
                password: ""
            });
        }
    };

    return (
        <div className='login-parent'>
            <div className='login-box'>
                <h1 style={{ fontSize: 60 }}>Login to Your Account</h1>
                <form style={{ display: 'flex', flexDirection: 'column' }}>
                    <input 
                        name='email' 
                        type='text' 
                        placeholder='Email' 
                        className='login-input-btn' 
                        onChange={handleLoginForm}
                        value={loginForm.email} 
                    />
                    
                    <br/>
                    <input 
                        name='password' 
                        type='password' 
                        placeholder='Password' 
                        className='login-input-btn' 
                        onChange={handleLoginForm}
                        value={loginForm.password} 
                    />
                    <br/>
                </form>
                <button 
                    className='login-submit-btn' 
                    type='submit'  
                    onClick={handleLoginSubmit}
                >
                    Sign In
                </button>
                <br/>
            </div>
            <div className='signup-box'>
                <h1 style={{ fontSize: 55 }}>New Here?</h1>
                <p style={{ fontSize: 25 }}>
                    Sign up and discover a great amount of new opportunities
                </p>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Link to={'/signup-as-customer'}><button className='signup-btn'>Sign Up as Customer</button></Link>
                    <Link to={'/signup-as-delivery'}><button className='signup-btn'>Sign Up as Delivery</button></Link>
                </div>
            </div>
        </div>
    );
}

export default Login;
