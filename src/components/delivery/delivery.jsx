import React, { useState, useEffect } from "react";
import "./delivery.css";
import Header2 from '../header/header2.js';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { useLoading } from "../../context/LoadingContext";
import LoadingIndicator from "../../context/LoadingIndicator";

export default function Deliver() {
  // State management
  const { startLoading, stopLoading } = useLoading();
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [activeButton, setActiveButton] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [previousOrders, setPreviousOrders] = useState([]);
  const [acceptedOrder, setAcceptedOrder] = useState(null);
  // const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const userToken = localStorage.getItem('userToken');
  let decodedToken = jwtDecode(userToken);

  // Load Bootstrap and React-Toastify styles
  useEffect(() => {
    startLoading();
    const userToken = localStorage.getItem('userToken');
    const userType = localStorage.getItem('userType');
    if (userType !== 'delivery-partner') {
      navigate('/login');
      stopLoading();
    }

    if (!userToken) {
      console.error('No token found');
      navigate('/login');
      stopLoading();
      return;
    }
    // Create a link element for Bootstrap CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css";
    link.id = "bootstrap-css";

    // Create a link element for FontAwesome icons
    const iconLink = document.createElement("link");
    iconLink.rel = "stylesheet";
    iconLink.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css";
    iconLink.id = "fontawesome-css";

    document.head.appendChild(link);
    document.head.appendChild(iconLink);

    // Responsive sidebar handling
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup: Remove injected resources when component unmounts
    return () => {
      document.head.removeChild(link);
      document.head.removeChild(iconLink);
      window.removeEventListener('resize', handleResize);
    };
  }, []);



  // Fetch orders data
  useEffect(() => {

    startLoading();
    let isMounted = true; // Prevent state update if unmounted

    const fetchOrders = async () => {
      try {
        // Fetch current orders
        const response = await axios.get("http://localhost:3000/delivery");
        console.log("Delivery Response:", response.data);
        if (isMounted) setOrders(response.data);

        // Post request to update delivery status
        const deliveryPartner = localStorage.getItem("name");
        const response2 = await axios.post("http://localhost:3000/delivery", {
          action: "2",
          deliveryPartner,
        });

        console.log(response2);
        if (response2.status === 200 && isMounted) {
          console.log(response2.data);
          setAcceptedOrder(response2.data);
        }

        const response4 = await axios.post("http://localhost:3000/delivery", {
          action: "4",
          email: decodedToken.email,
        });

        if (response4.status === 200) {
          let fetchedOrders = response4.data || [];

          fetchedOrders.sort((a, b) => b.id - a.id);

          setPreviousOrders(fetchedOrders);
        } else {
          setPreviousOrders([]);
        }


      } catch (error) {
        console.error("Error fetching delivery data:", error);
        if (isMounted) setError("Failed to load orders. Please try again later.");
      }
      finally {
        stopLoading();
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 2000);
    return () => {
      clearInterval(interval);
      isMounted = false; // Cleanup function to avoid state updates
    };

    // Fetch every 10 seconds

  }, []);



  // UI Interaction Handlers
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName);
  };

  const handleAcceptOrder = async (orderId) => {
    const orderToAccept = orders.find((order) => order.id === orderId);
    if (orderToAccept) {

      await axios.patch("http://localhost:3000/delivery", {
        id: orderId,
        name: localStorage.getItem('name'),
        email: jwtDecode(userToken).email
      });

      await axios.post("http://localhost:3000/delivery", {
        action: "1",
        order: { ...orderToAccept, deliveryPartner: localStorage.getItem('name') }
      });
      startLoading();
      try {
        const response = await axios.delete(`http://localhost:3000/delivery`, {
          data: { id: orderToAccept.id, action: "1" }
        });

        if (response.status === 200) {
          setOrders((prev) => prev.filter((order) => order.id !== orderId));
        }
      } catch (error) {
        console.error(
          'Error deleting order:',
          error.response?.data || error.message
        );
      }
      finally{
        stopLoading();
      }

      const response2 = await axios.post("http://localhost:3000/delivery", {
        action: "2",
        deliveryPartner: localStorage.getItem('name')
      });

      if (response2.status === 200) {
        setAcceptedOrder(orderToAccept);
      }

      // setAcceptedOrder(orderToAccept);
      console.log(orderToAccept);
      toast.success(`Order from ${orderToAccept.restName} accepted!`, {
        position: "top-right",
        autoClose: 2000
      });
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    try {
      console.log(acceptedOrder);
      setLoading(true);
      const callBack = await axios.post("http://localhost:3000/send-otp", {
        email: acceptedOrder.customerEmail, // Make sure customerEmail is available
        orderId: acceptedOrder.id,
      });
      console.log(callBack.status);

      if(callBack.status==404)
      {
        toast.error("Delivery has still not been handled by the restaurant");
        setLoading(false);
        return;
      }

      setOtpSent(true);
      toast.success("OTP sent! Enter it below to verify.");
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to send OTP. Delivery has still not been handled by the restaurant");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtpAndDeliverOrder = async (orderId) => {
    console.log(orderId);

    try {
      setLoading(true);

      console.log("Sending orderId:", acceptedOrder.id);
      console.log("Sending otp:", otp);

      const response = await axios.post("http://localhost:3000/verify-otp", {
        orderId: acceptedOrder.id,
        otp: otp,
      });

      console.log("Server Response:", response.data);

      if (response.status == 200) {
        setOtpSent(false);
        setOtp(null);
        console.log("hi")
        // Create a new object with updated status
        console.log("hii")

        const updatedOrder = {
          ...acceptedOrder,
          status: "Delivered",
          deliveryTime: new Date().toLocaleTimeString(),
        };
        // Update orders state (remove from active orders)
        setOrders((orders) => orders.filter((order) => order.id !== orderId));

        setPreviousOrders((prev) => [updatedOrder, ...prev]);
        const response3 = await axios.post("http://localhost:3000/delivery", {
          action: "3",
          deliveryEmail: decodedToken.email,
          order: updatedOrder,
          name: localStorage.getItem('name')
        });

        if (response3.status == 200) {

          setAcceptedOrder(null);
          // Show success notification
          toast.success("Order delivered successfully! Earnings added to your account.", {
            position: "top-right",
            autoClose: 3000
          });

          const response2 = await axios.delete(`http://localhost:3000/delivery`, {
            data: { id: acceptedOrder.id, action: "2" }
          });

          if (response2.status === 200) {
            setAcceptedOrder(null);
          }
        }
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Invalid OTP. Please try again");
    } finally {
      setLoading(false);
    }

  };

  // Format price to display properly
  // const formatPrice = (price) => {
  //   if (!price) return "₹0";
  //   if (typeof price === 'object' && price.$numberDecimal) {
  //     return `₹${price.$numberDecimal}`;
  //   }
  //   return `₹${price}`;
  // };

  // Render content based on active section
  let content;

  // if (isLoading) {
  //   content = (
  //     <div className="text-center my-5">
  //       <div className="spinner-border text-primary" role="status">
  //         <span className="visually-hidden">Loading...</span>
  //       </div>
  //       <p className="mt-3">Loading orders...</p>
  //     </div>
  //   );
  // } else if (error) {
  //   content = (
  //     <div className="alert alert-danger" role="alert">
  //       <i className="fas fa-exclamation-circle me-2"></i>
  //       {error}
  //     </div>
  //   );
  // } 
  if (activeButton === "orders") {
    if (acceptedOrder) {
      content = (
        <div className="card mb-3 " key={acceptedOrder.id}>

          <div className="card-body">
            <div className="d-flex justify-content-between flex-column flex-md-row">
              <div>
                <p className="mb-3 fw-bold">
                  {acceptedOrder.orderDetails ?
                    acceptedOrder.orderDetails.map((item) => `${item.itemName} (x${item.quantity})`).join(", ") :
                    acceptedOrder.items}
                </p>

                <div className="mb-3">

                  <span className="badge bg-warning text-dark">
                    <i className="fas fa-box me-1"></i>
                    {acceptedOrder.totalItems ||
                      (acceptedOrder.orderDetails ? acceptedOrder.orderDetails.reduce((sum, item) => sum + item.quantity, 0) : "?")} items
                  </span>&nbsp;&nbsp;&nbsp;
                  {acceptedOrder.paymentMethod === 'COD' ?
                    <span className="badge bg-danger text-light">
                      <i className="fas fa-box me-1"></i>
                      Payment : Cash on Delivery
                    </span> : <span className="badge bg-success text-light">
                      <i className="fas fa-box me-1"></i>
                      Payment : Online Payment
                    </span>}
                </div>

                <div className="card mb-3 bg-light">
                  <div className="card-body py-2">
                    <h6 className="mb-2"><i className="fas fa-store me-2 text-primary"></i>Restaurant</h6>
                    <p className="mb-1 fw-bold">{acceptedOrder.restName || acceptedOrder.restaurent}</p>
                    <p className="mb-1 small">{acceptedOrder.restAddress || acceptedOrder["restaurent-address"]}</p>
                    <p className="mb-0 small"><i className="fas fa-phone me-1"></i>{acceptedOrder.restPhone || "Not available"}</p>
                  </div>
                </div>

                <div className="card bg-light">
                  <div className="card-body py-2">
                    <h6 className="mb-2"><i className="fas fa-user me-2 text-primary"></i>Customer</h6>
                    <p className="mb-1 fw-bold">{acceptedOrder.customerName || "Customer"}</p>
                    <p className="mb-1 small">{acceptedOrder.customerAddress || acceptedOrder["customer-address"]}</p>
                    <p className="mb-0 small"><i className="fas fa-phone me-1"></i>{acceptedOrder.customerPhone || "Not available"}</p>
                  </div>
                </div>
              </div>

              <div className="text-md-end mt-3 mt-md-0">
                <div className="card bg-success text-white mb-3">
                  <div className="card-body py-2 text-center">
                    <p className="mb-0 fw-normal">Total Bill</p>
                    <p className="fs-3 fw-bold mb-0">
                      ₹{acceptedOrder.billTotal}
                    </p>
                    <p className="fw-bold mb-0 mt-2">
                      Your earnings: ₹{acceptedOrder.deliveryFee}
                    </p>
                  </div>
                </div>

                {!otpSent ? (
                  <button type="button" className="btn btn-primary btn-lg w-100" onClick={sendOtp} disabled={loading}>
                    <i className="fas fa-check-circle me-2"></i>
                    {loading ? "Sending OTP..." : "Mark as Delivered"}
                  </button>
                ) : (
                  <div>
                    <input
                      type="text"
                      className="form-control mb-2"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                    <button type="button" className="btn btn-success w-100" onClick={verifyOtpAndDeliverOrder} disabled={loading}>
                      {loading ? "Verifying OTP..." : "Verify & Deliver Order"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    } 
    // else if (orders.length === 0) {
    //   content = (
    //     <div className="text-center my-5">
    //       <i className="fas fa-motorcycle fa-3x text-muted mb-3"></i>
    //       <h4>No new orders available</h4>
    //       <p className="text-muted">Check back soon for new delivery opportunities</p>
    //     </div>
    //   );
    // } 
    else {
      content = orders.map((order) => (
        <div className="card mb-3 hover-effect" key={order.id}>
          <div className="card-body">
            <div className="d-flex justify-content-between flex-column flex-md-row">
              <div className="mb-3 mb-md-0">
                <p className="mb-2 fw-bold">
                  {order.orderDetails ?
                    order.orderDetails.map((item) => `${item.itemName} (x${item.quantity})`).join(", ") :
                    (order.items || "Various items")}
                </p>

                <div className="mb-3">
                  <span className="badge bg-secondary me-2">
                    <i className="fas fa-box me-1"></i>
                    {order.totalItems ||
                      (order.orderDetails ? order.orderDetails.reduce((sum, item) => sum + item.quantity, 0) : "?")} items
                  </span>
                </div>

                <div className="row g-2">
                  <div className="col-12 col-md-6">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-store text-primary me-2"></i>
                      <div>
                        <p className="mb-0 fw-medium">{order.restName || order.restaurent}</p>
                        <p className="text-muted mb-0 small">{order.restAddress || order["restaurent-address"]}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-map-marker-alt text-danger me-2"></i>
                      <div>
                        <p className="mb-0 fw-medium">{order.customerName || "Customer"}</p>
                        <p className="text-muted mb-0 small">{order.customerAddress || order["customer-address"]}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center text-md-end">
                <p className="fs-4 fw-bold mb-1 text-primary">
                  ₹{order.billTotal}
                </p>
                <p className="fw-bold mb-3 text-success">
                  <i className="fas fa-coins me-1"></i>
                  Earnings: ₹{order.deliveryFee}
                </p>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => {
                    setLoading(false);
                    handleAcceptOrder(order.id)
                  }}
                >
                  <i className="fas fa-motorcycle me-2"></i>
                  Accept Order
                </button>
              </div>
            </div>
          </div>
        </div>
      ));
    }
  } else if (activeButton === "previous") {
    if (previousOrders.length === 0) {
      content = (
        <div className="text-center my-5">
          <i className="fas fa-history fa-3x text-muted mb-3"></i>
          <h4>No previous orders</h4>
          <p className="text-muted">Your completed deliveries will appear here</p>
        </div>
      );
    } else {
      content = (
        <>
          <div className="mb-4">
            <div className="card bg-light">
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-6">
                    <h3 className="mb-0 fw-bold text-primary">{previousOrders.length}</h3>
                    <p className="mb-0">Total Deliveries</p>
                  </div>
                  <div className="col-6">
                    <h3 className="mb-0 fw-bold text-success">
                      ₹{previousOrders.reduce(
                        (sum, order) => sum + order.deliveryFee,
                        0
                      )}
                    </h3>
                    <p className="mb-0">Total Earnings</p>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {previousOrders.map((order) => (
            <div className="card mb-3" key={order.id}>
              <div className="card-body">
                <div className="d-flex justify-content-between flex-column flex-md-row">
                  <div>
                    <div className="d-flex justify-content-between mb-2">
                      <p className="mb-0 fw-bold">{order.items ||
                        (order.orderDetails ? order.orderDetails.map(item => `${item.itemName} (x${item.quantity})`).join(", ") : "Various items")}</p>
                      <span className="badge bg-success ms-2 d-md-none">{order.status || "Delivered"}</span>
                    </div>

                    <p className="text-muted mb-1 small">
                      <i className="fas fa-calendar-alt me-1"></i>
                      {order.orderDate}
                    </p>

                    <div className="d-flex mt-2 text-muted small">
                      <p className="mb-0">
                        <i className="fas fa-store me-1 text-primary"></i>
                        {order.restName ? order.restName : order.restaurantName}
                      </p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      <p className="mb-0">
                        <i className="fas fa-map-marker-alt me-1 text-danger"></i>
                        {order.customerName}
                      </p>
                    </div>


                    <p className="fw-bold mt-2 text-success">
                      <i className="fas fa-coins me-1"></i>
                      Earned: {order.deliveryFee}
                    </p>
                  </div>

                  <div className="text-md-end">
                    <p className="fs-5 fw-bold mb-2">₹{order.billTotal ? order.billTotal : order.totalPrice + order.deliveryFee}</p>
                    <span className="badge bg-success-subtle text-success px-3 py-2 d-none d-md-inline-block">
                      <i className="fas fa-check-circle me-1"></i>
                      {order.status || "Delivered"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </>
      );
    }
  } else if (activeButton === "support") {
    content = (
      <div className="card">
        <div className="card-body">
          <h3 className="card-title mb-4">How Can We Help You?</h3>

          <div className="alert alert-info mb-4">
            <div className="d-flex">
              <i className="fas fa-info-circle fa-2x me-3 align-self-center"></i>
              <p className="mb-0">
                Our support team is available 24/7 to assist you with any queries or issues you may encounter during deliveries.
              </p>
            </div>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 bg-light">
                <div className="card-body text-center">
                  <i className="fas fa-envelope fa-2x text-primary mb-3"></i>
                  <h5>Email Support</h5>
                  <p className="mb-0">support@fooddelivery.com</p>
                  <p className="text-muted small">Response within 24 hours</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 bg-light">
                <div className="card-body text-center">
                  <i className="fas fa-phone-alt fa-2x text-primary mb-3"></i>
                  <h5>Phone Support</h5>
                  <p className="mb-0">1-800-123-4567</p>
                  <p className="text-muted small">Available 24/7</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 bg-light">
                <div className="card-body text-center">
                  <i className="fas fa-comment-dots fa-2x text-primary mb-3"></i>
                  <h5>Live Chat</h5>
                  <button className="btn btn-outline-primary mt-2">Start Chat</button>
                  <p className="text-muted small mt-2">Typical response: 5 minutes</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <>
      <LoadingIndicator />
      <br />
      <ToastContainer />
      <div className="container-fluid vh-100 d-flex">
        {/* Left Sidebar */}
        <div
          className={`d-flex flex-column sidebar-divider vh-100 p-2 mt-3 ${isSidebarOpen ? "col-lg-3 col-md-4" : "col-auto"
            } sidebar`}
        >
          <div
            className="toggle-button d-flex align-items-center justify-content-center"
            onClick={toggleSidebar}
          >
            {isSidebarOpen ? <i className="fas fa-chevron-left"></i> : <i className="fas fa-chevron-right"></i>}
          </div>

          {isSidebarOpen ? (
            <div className="mt-4">
              <div
                className={`sidebar-button ${activeButton === "orders" ? "active" : ""}`}
                onClick={() => handleButtonClick("orders")}
              >
                <i className="fas fa-motorcycle me-2"></i> New Orders
                {orders.length > 0 && !acceptedOrder ? (
                  <span className="badge rounded-pill bg-danger float-end">{orders.length}</span>
                ) : null}
              </div>
              <div
                className={`sidebar-button ${activeButton === "previous" ? "active" : ""}`}
                onClick={() => handleButtonClick("previous")}
              >
                <i className="fas fa-history me-2"></i> Previous Orders
              </div>
              <div
                className={`sidebar-button ${activeButton === "support" ? "active" : ""}`}
                onClick={() => handleButtonClick("support")}
              >
                <i className="fas fa-headset me-2"></i> Support
              </div>
            </div>
          ) : (
            <div className="mt-4 d-flex flex-column align-items-center">
              <div
                className={`sidebar-button-icon ${activeButton === "orders" ? "active" : ""}`}
                onClick={() => handleButtonClick("orders")}
                title="New Orders"
              >
                <i className="fas fa-motorcycle"></i>
                {orders.length > 0 && !acceptedOrder ? (
                  <span className="badge rounded-pill bg-danger position-absolute top-0 start-100 translate-middle" style={{ fontSize: '0.6rem' }}>{orders.length}</span>
                ) : null}
              </div>
              <div
                className={`sidebar-button-icon ${activeButton === "previous" ? "active" : ""}`}
                onClick={() => handleButtonClick("previous")}
                title="Previous Orders"
              >
                <i className="fas fa-history"></i>
              </div>
              <div
                className={`sidebar-button-icon ${activeButton === "support" ? "active" : ""}`}
                onClick={() => handleButtonClick("support")}
                title="Support"
              >
                <i className="fas fa-headset"></i>
              </div>
            </div>
          )}
        </div>

        {/* Right Order Section */}
        <div className="col vh-100 overflow-auto p-3 p-md-4 p-lg-5">
          {/* Header with Divider */}
          <div className="header-divider mb-4">
            <h2 className="h5 mb-3">
              {activeButton === "orders" && (
                <div>
                  {acceptedOrder ? (
                    <><i className="fas fa-route me-2 text-primary"></i>Current Delivery</>
                  ) : (
                    <><i className="fas fa-motorcycle me-2 text-primary"></i>Available Orders</>
                  )}
                </div>
              )}
              {activeButton === "previous" && (
                <div><i className="fas fa-history me-2 text-primary"></i>Delivery History</div>
              )}
              {activeButton === "support" && (
                <div><i className="fas fa-headset me-2 text-primary"></i>Support Center</div>
              )}
            </h2>
            <hr />
          </div>

          {/* Render content based on active tab */}
          {content}

          {/* Empty state for no orders */}
          {activeButton === "orders" && orders.length === 0 && !acceptedOrder && (
            <div className="text-center my-5">
              <i className="fas fa-motorcycle fa-3x text-muted mb-3"></i>
              <h4>No new orders available</h4>
              <p className="text-muted">Check back soon for new delivery opportunities</p>
            </div>
          )}
        </div>
      </div>

      {/* Add script to handle Bootstrap JS components */}
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" defer></script>
    </>
  );
}