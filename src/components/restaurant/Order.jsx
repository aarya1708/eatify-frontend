import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import "./Order.css";
import Header from "./header.js";
import { PrevOrderContext } from '../../context/prevOrder-context.js';
import { useNavigate } from 'react-router-dom';
import { useLoading } from "../../context/LoadingContext";
import LoadingIndicator from "../../context/LoadingIndicator";

export default function Order() {

  
  const { prevOrder, setprevOrder } = useContext(PrevOrderContext);

  useEffect(() => {
    const bootstrapLink = document.createElement("link");
    bootstrapLink.rel = "stylesheet";
    bootstrapLink.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css";
    bootstrapLink.id = "bootstrap-css";

    const iconsLink = document.createElement("link");
    iconsLink.rel = "stylesheet";
    iconsLink.href = "https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css";
    iconsLink.id = "bootstrap-icons-css";

    document.head.appendChild(bootstrapLink);
    document.head.appendChild(iconsLink);

    return () => {
      document.head.removeChild(bootstrapLink);
      document.head.removeChild(iconsLink);
    };
  }, []);

  const { startLoading, stopLoading } = useLoading();
  const [view, setView] = useState("current");
  const [currentOrders, setCurrentOrders] = useState([]);
  const [filter, setFilter] = useState({ fromDate: "", toDate: "", orderId: "" });
  const [previousOrders, setPreviousOrders] = useState([]);
  const restaurantName = localStorage.getItem("name");
    const navigate = useNavigate();  
  
  useEffect(() => {
    startLoading();
    const userType = localStorage.getItem('userType');
     if(userType!=='restaurant')
     {
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
    const fetchOrders = async () => {
      try {
        const response = await axios.post("https://eatify-backend.vercel.app/rest-order", {
          action: "restaurant",
          restaurantName: restaurantName,
        });
        stopLoading();
        setCurrentOrders(response.data.orders);

        const sortedPreviousOrders = [...response.data.prevOrders].sort(
          (a, b) => b.id - a.id
        );
        setPreviousOrders(sortedPreviousOrders);
        // console.log(response.data.orders)
        // console.log(response.data.prevOrders);
      } catch (error) {
        console.error("Axios Error:", error.response?.data || error.message);
      }
    };
    fetchOrders();

    const interval = setInterval(fetchOrders, 10000); // Fetch every 10 seconds

    return () => clearInterval(interval);
  }, []);



  const updateOrderStatus = async (id) => {
    try {
      const response = await axios.patch("https://eatify-backend.vercel.app/rest-order", {
        restaurantName: restaurantName,
        id: id,
      });

      if (response.status === 200) {
        // Create an updated version of the orders list before setting state
        const updatedOrders = currentOrders.map((order) =>
          order.id === id ? { ...order, status: "Accepted" } : order
        );

        // Find the updated order immediately
        let deliveryOrder = updatedOrders.find((order) => order.id === id);
        // console.log("Updated delivery order:", deliveryOrder);

        setCurrentOrders(updatedOrders);

        axios.post("https://eatify-backend.vercel.app/rest-order", {
          action: "delivery",
          order: deliveryOrder
        })
          .then((res) => console.log("Order sent to delivery:"))
          .catch((err) => console.error("Error sending order to delivery:", err.response?.data || err.message));
      }
    }

    catch (error) {
      console.error("Error updating order status:", error.response?.data || error.message);
    }
  };


  const HandleDelivery = async (id) => {
    const orderToMove = currentOrders.find((order) => order.id === id);

    if (!orderToMove || orderToMove.deliveryPartner === "NULL") {
      alert("Delivery Partner yet not assigned for this order. Please wait.");
      return;
    }

    const confirmComplete = window.confirm("Are you sure you want to mark this order as completed?");
    if (!confirmComplete) return;
    // console.log("orderdate check karva", orderToMove)
    await setprevOrder(orderToMove);
    // console.log(orderToMove);
    try {
      const response = await axios.delete(`https://eatify-backend.vercel.app/rest-order`, {
        data: { restaurantName: restaurantName, id: orderToMove.id },
      });

      const response2 = await axios.post("https://eatify-backend.vercel.app/rest-order", {
        action: "prevOrder",
        order: orderToMove
      });

      if (response.status === 200) {
        setCurrentOrders((prev) => prev.filter((order) => order.id !== id));
        setPreviousOrders((prev) => [orderToMove, ...prev]);
      }
    } catch (error) {
      console.error(
        'Error deleting order:',
        error.response?.data || error.message
      );
    }
  };

  const filteredPreviousOrders = previousOrders.filter((order) => {
    const orderDate = new Date(order.orderDate + "T00:00:00"); // Ensuring it's parsed as a valid Date

    const matchesFromDate =
      filter.fromDate === "" || orderDate >= new Date(filter.fromDate);

    const matchesToDate =
      filter.toDate === "" || orderDate <= new Date(filter.toDate);

    const matchesOrderId =
      filter.orderId === "" || order.id.toString().includes(filter.orderId);

    return matchesFromDate && matchesToDate && matchesOrderId;
  });


  return (
    <>
    <LoadingIndicator />
      <Header />
      <div className="container mt-5">
        <div className="d-flex align-items-center justify-content-start mb-4">
          <h3 className={`me-4 cursor-pointer ${view === "current" ? "selected" : "text-muted"}`} onClick={() => setView("current")}>
            Current Orders
            {view === 'current' && <div className="underline"></div>}
          </h3>
          <h3 className={`cursor-pointer ${view === "previous" ? "selected" : "text-muted"}`} onClick={() => setView("previous")}>
            Previous Orders
            {view === 'previous' && <div className="underline"></div>}
          </h3>
        </div>

        {view === "current" ? (
          <div className="card shadow-sm">
            <div className="card-body">
              <table className="table table-bordered table-hover">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Order ID</th>
                    <th>Customer Name</th>
                    <th>Order Details</th>
                    <th>Total Quantity</th>
                    <th>Order Total</th>
                    <th>Delivery Partner</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.map((order, index) => (
                    <tr key={order._id}>
                      <td>{index + 1}</td>
                      <td>{order?.id}</td>
                      <td>{order?.customerName}</td>
                      <td>
                        {order?.orderDetails.map((item, i) => (
                          <div key={i}>
                            {item.quantity}x {item.itemName}
                          </div>
                        ))}
                      </td>
                      <td>{order?.totalQuantity}</td>
                      <td>₹{order?.totalPrice}</td>
                      <td>{order?.status === "Pending" ?
                        "Order yet not accepted"
                        :
                        order.deliveryPartner === 'NULL' ? "Delivery Partner will be assigned shortly" : (order.deliveryPartner)}</td>
                      <td>
                        {order?.status === "Pending" ? (
                          <>
                            <button
                              className="btn btn-primary btn-sm me-2"
                              onClick={() => updateOrderStatus(order.id)}
                              title="Accept Order"
                            >
                              Accept
                            </button>

                          </>
                        ) : (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => HandleDelivery(order.id)}
                          >
                            Handle to delivery
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-3">
              <div className="row g-3">
                <div className="col-md-4">
                  <label htmlFor="fromDate" className="form-label">From Date</label>
                  <input type="date" id="fromDate" className="form-control" value={filter.fromDate} onChange={(e) => setFilter((prev) => ({ ...prev, fromDate: e.target.value }))} />
                </div>
                <div className="col-md-4">
                  <label htmlFor="toDate" className="form-label">To Date</label>
                  <input type="date" id="toDate" className="form-control" value={filter.toDate} onChange={(e) => setFilter((prev) => ({ ...prev, toDate: e.target.value }))} />
                </div>
                <div className="col-md-4">
                  <label htmlFor="orderId" className="form-label">Order ID</label>
                  <input type="text" id="orderId" className="form-control" value={filter.orderId} onChange={(e) => setFilter((prev) => ({ ...prev, orderId: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="card shadow-sm">
              <div className="card-body">
                <table className="table table-bordered table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Order ID</th>
                      <th>Order Date</th>
                      <th>Customer Name</th>
                      <th>Order Details</th>
                      <th>Order Total</th>
                      <th>Delivery Partner</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPreviousOrders?.map((order, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{order?.id}</td>
                        <td>{order.orderDate ? order.orderDate : new Date().toLocaleDateString('en-CA')}</td>
                        <td>{order?.customerName}</td>
                        <td>
                          {order?.orderDetails.map((item, i) => (
                            <div key={i}>
                              {item.quantity}x {item.itemName}
                            </div>
                          ))}
                        </td>
                        <td>₹{order?.totalPrice}</td>
                        <td>{order?.deliveryPartner}</td>
                        <td><span className="badge bg-success">Completed</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}





      </div>
    </>
  );
}
