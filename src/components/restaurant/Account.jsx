import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useLoading } from "../../context/LoadingContext";
import LoadingIndicator from "../../context/LoadingIndicator";

export default function Account() {
  useEffect(() => {
    const bootstrapCSS = document.createElement('link');
    bootstrapCSS.rel = 'stylesheet';
    bootstrapCSS.href =
      'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css';
    document.head.appendChild(bootstrapCSS);

    const iconsCSS = document.createElement('link');
    iconsCSS.rel = 'stylesheet';
    iconsCSS.href =
      'https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css';
    document.head.appendChild(iconsCSS);

    return () => {
      document.head.removeChild(bootstrapCSS);
      document.head.removeChild(iconsCSS);
    };
  }, []);

  const { startLoading, stopLoading } = useLoading();
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [restaurant, setRestaurant] = useState({});
  const navigate = useNavigate();
  useEffect(() => {
    startLoading();
    const userType = localStorage.getItem('userType');
    if (userType !== 'restaurant') {
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
    const fetchRestaurant = async () => {
      try {
        const restaurantName = localStorage.getItem("name");
        const response = await axios.post("https://eatify-backend.vercel.app//rest-acc", { name: restaurantName });
    
        setRestaurant(response.data);
      
        const response2 = await axios.post("https://eatify-backend.vercel.app//rest-earnings", { email: response.data.email });
        if (response2.data.previousOrders && Array.isArray(response2.data.previousOrders)) {
          const earnings = response2.data.previousOrders.reduce(
            (sum, order) => sum + (order.totalPrice || 0), 
            0
          );
          setTotalEarnings(earnings);
        } else {
          setTotalEarnings(0);
        }
      } catch (err) {
        console.error("Error fetching restaurant:", err);
      } finally {
        stopLoading();
      }
    };
    
    fetchRestaurant();
  }, []);

  const handleBack = () => {
    navigate('/rest-menu');
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStars = rating % 1 !== 0 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStars;

    return (
      <>
        {restaurant.rating ? (
          <>
            {[...Array(fullStars)].map((_, index) => (
              <i key={`full-${index}`} className="bi bi-star-fill text-warning me-1"></i>
            ))}
            {halfStars > 0 && <i className="bi bi-star-half text-warning me-1"></i>}
            {[...Array(emptyStars)].map((_, index) => (
              <i key={`empty-${index}`} className="bi bi-star text-muted me-1"></i>
            ))}
          </>
        ) : ""}

      </>
    );
  };

  return (
    <>
      <LoadingIndicator />
      <div
        className="container-fluid py-5"
        style={{ backgroundColor: '#f8f9fa' }}
      >
        <div className="container">
          <div className="mb-3">
            <button
              className="btn btn-outline-secondary rounded-pill px-4"
              onClick={handleBack}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back
            </button>
          </div>

          <div className="card p-0 shadow-lg border-0 rounded-4 overflow-hidden">
            <div
              className="bg-light p-4 position-relative"
              style={{ borderBottom: '1px solid #e5e5e5' }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <h1 className="fw-bold mb-0 text-dark">Restaurant Dashboard</h1>
                <div className="d-flex align-items-center">
                  <div className="badge bg-warning text-dark p-2 fs-6 me-3">
                    <i className="bi bi-star-fill me-1"></i>
                    {restaurant.rating?.toFixed(1)}
                  </div>
                  <button
                    className="btn btn-danger rounded-pill px-4"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Logout
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="row g-4">
                <div className="col-md-5">
                  <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                    <div className="position-relative">
                      <img
                        src={restaurant.photoUrl}
                        alt="Profile"
                        className="img-fluid w-100"
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                    </div>
                    <div className="card-body">
                      <h3 className="fw-bold mb-3">{restaurant.name}</h3>
                      <p className="text-muted mb-2">{restaurant.highlights}</p>
                      <div className="d-flex align-items-center mb-3">
                        {renderStars(restaurant.rating)}
                      </div>
                      <div className="d-flex align-items-center p-2 bg-light rounded-3">
                        <i className="bi bi-geo-alt-fill text-danger me-2 fs-5"></i>
                        <span className="fw-medium">{restaurant.address}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-7">
                  <div className="card h-100 border-0 shadow-sm rounded-4">
                    <div className="card-header bg-light border-0 py-3">
                      <h4 className="fw-bold mb-0">Restaurant Earnings</h4>
                    </div>
                    {/* <br/><br/><br/> */}
                    <div className="card-body">
                      <div
                        className="card h-75 border-0 rounded-4 p-4 mb-0"
                        style={{
                          background:
                            'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-center h-100">
                          <div>
                            <h6 className="text-success mb-2 fw-semibold">
                              Total Earnings
                            </h6>
                            <h1 className="display-4 fw-bold text-success mb-0">
                              ₹{totalEarnings}
                            </h1>
                          </div>
                          <div
                            className="text-success opacity-25"
                            style={{ fontSize: '7rem' }}
                          >
                            <i className="bi bi-currency-rupee"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
