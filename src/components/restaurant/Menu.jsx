import React, { useState, useEffect } from 'react';
import Header from './header.js';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLoading } from "../../context/LoadingContext";
import LoadingIndicator from "../../context/LoadingIndicator";


export default function Menu() {
  const { startLoading, stopLoading } = useLoading();
  const navigate = useNavigate();
  const [restaurantName, setRestaurantName] = useState('');
  const [restData, setRestData] = useState(null);
  const [menu, setMenu] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [newCategory, setNewCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [categories, setCategories] = useState(['All']);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingDishName, setEditingDishName] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [newDish, setNewDish] = useState({
    name: '',
    price: '',
    description: '',
    photoUrl: '',
    category: '',
    veg: '',
  });

  useEffect(() => {

    setRestaurantName("McDonald's");
  }, []);

  useEffect(() => {
    startLoading();
    const userToken = localStorage.getItem('userToken');
    if (!userToken) {
      console.error('No token found');
      navigate('/login');
      stopLoading();
      return;
    }
    const userType = localStorage.getItem('userType');
    if (userType !== 'restaurant') {
      navigate('/login');
      stopLoading();
    }

    try {
      const decodedToken = jwtDecode(userToken);
      const restEmail = decodedToken.email;

      if (!restEmail) {
        console.error('No email found in token');
        return;
      }

      axios
        .post("http://localhost:9000/McDonald's", { action: 'user', email: restEmail })
        .then((response) => {
          setRestData(response.data);
          setMenu(response.data.menu);
          setRestaurantName(encodeURIComponent(response.data.name));
          console.log(encodeURIComponent(response.data.name));
        })
        .catch((error) => {
          console.error(
            'Error fetching profile data:',
            error.response?.data || error.message
          );
        });
    } catch (error) {
      console.error('Error decoding token:', error);
    } finally {
      stopLoading();
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href =
      'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css';
    link.id = 'bootstrap-css';

    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    if (menu) {
      setMenuItems(menu);

      const uniqueCategories = new Set(menu.map((item) => item.category));
      setCategories(['All', ...Array.from(uniqueCategories)]);
    }
  }, [menu]);

  const filteredItems =
    activeCategory === 'All'
      ? menuItems?.filter((item) => item && item.category)
      : menuItems?.filter((item) => item && item.category === activeCategory);

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewDish((prev) => ({ ...prev, category: newCategory.trim() }));
      setIsModalOpen(true);
      setIsAddingCategory(false);
      setNewCategory('');
    }
  };

  const handleAddOrUpdateDish = async () => {
    startLoading();
    if (
      newDish.name &&
      newDish.price &&
      newDish.description &&
      newDish.photoUrl &&
      newDish.category &&
      newDish.veg
    ) {
      try {

        if (isEditing) {
          const response = await axios.patch(
            `http://localhost:9000/${restaurantName}`,
            {
              oldDishName: editingDishName,
              name: newDish.name,
              price: parseFloat(newDish.price),
              category: newDish.category,
              description: newDish.description,
              veg: newDish.veg,
              photoUrl: newDish.photoUrl,
            }
          );


          if (response.status === 200) {
            toast.success("Dish updated successfully!");
            setMenuItems(
              menuItems.map((item) =>
                item.name === editingDishName
                  ? { ...item, ...response.data.updatedDish }
                  : item
              )
            );
            setRefresh(prev => !prev);
          }
        } else {
          const response = await axios.post(
            `http://localhost:9000/${restaurantName}`,
            {
              action: 'adddish',
              name: newDish.name,
              price: parseFloat(newDish.price),
              category: newDish.category,
              description: newDish.description,
              veg: newDish.veg,
              photoUrl: newDish.photoUrl,
            }
          );


          if (response.status === 201) {
            toast.success("Dish added successfully!");
            setMenuItems([...menuItems, newDish]);
            setRefresh(prev => !prev);

            if (!categories.includes(newDish.category)) {
              setCategories([...categories, newDish.category]);
            }
          }
          else {
            console.error("Invalid response data:", response.data);
          }
        }

        setIsModalOpen(false);
        setNewDish({
          name: '',
          price: '',
          description: '',
          photoUrl: '',
          category: '',
          veg: '',
        });
        setIsEditing(false);
        setEditingDishName(null);
      } catch (error) {
        console.error(
          'Error adding/updating dish:',
          error.response?.data || error.message
        );

        console.error("Error in add/update request:", error);
        if (error.response) {
          console.error("Response error:", error.response.data);
        } else {
          console.error("Error message:", error.message);
        }
      } finally {
        stopLoading();
      }
    }
  };

  const handleEditDish = (dish) => {
    setNewDish(dish);
    setIsEditing(true);
    setEditingDishName(dish.name);
    setIsModalOpen(true);
  };

  const handleDeleteDish = async () => {
    startLoading();
    try {
      const response = await axios.delete(`http://localhost:9000/${restaurantName}`, {
        data: { name: editingDishName },
      });

      if (response.status === 200) {
        toast.success("Dish deleted successfully!");
        const updatedMenuItems = menuItems.filter(
          (item) => item.name !== editingDishName
        );
        const updatedCategories = categories.filter(
          (category) =>
            category === 'All' ||
            updatedMenuItems.some((item) => item.category === category)
        );

        setMenuItems(updatedMenuItems);
        setCategories(updatedCategories);

        if (!updatedCategories.includes(activeCategory)) {
          setActiveCategory('All');
        }

        setIsModalOpen(false);
        setIsEditing(false);
        setEditingDishName(null);
      }
    } catch (error) {
      console.error(
        'Error deleting dish:',
        error.response?.data || error.message
      );
    } finally {
      stopLoading();
    }
  };

  return (
    <>
      <LoadingIndicator />
      <Header />
      <ToastContainer
        position="top-right"
        autoClose={1250}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ top: '120px', right: '50px' }}
      />


      <div className="container my-5">
        <h1 className="text-center mb-4">Menu</h1>

        <div className="d-flex justify-content-center mb-4">
          {categories.map((category, index) => (
            <button
              key={index}
              className={`btn mx-2 ${activeCategory === category
                ? 'btn-primary'
                : 'btn-outline-primary'
                }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}

          <button
            className="btn btn-outline-success mx-2"
            onClick={() => setIsAddingCategory(!isAddingCategory)}
          >
            <strong>+</strong> Add
          </button>

          {isAddingCategory && (
            <div className="d-flex align-items-center ml-2">
              <input
                type="text"
                className="form-control"
                placeholder="New Category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <button
                className="btn btn-primary ml-2"
                onClick={handleAddCategory}
              >
                Submit
              </button>
            </div>
          )}
        </div>

        <div className="row">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div className="col-md-4 mb-4" key={item.name}>
                <div className="card h-100">
                  <img
                    src={item.photoUrl}
                    className="card-img-top"
                    alt={item.name}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{item.name}</h5>
                    <p className="card-text">{item.description}</p>
                    <span
                      className={`badge ${item.veg === 'veg' ? 'bg-success' : 'bg-danger'
                        }`}
                    >
                      {item.veg === 'veg' ? 'Veg' : 'Non-Veg'}
                    </span>
                    <div className="d-flex justify-content-between align-items-center">
                      <p className="card-text m-0">
                        <strong>₹{item.price}</strong>
                      </p>
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => handleEditDish(item)}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No items available for this category.</p>
          )}

          {activeCategory !== 'All' && (
            <div className="col-md-4 mb-4">
              <div className="card h-100">
                <button
                  className="btn btn-light w-100 h-100 d-flex justify-content-center align-items-center text-dark"
                  onClick={() => {
                    setNewDish({ ...newDish, category: activeCategory });
                    setIsModalOpen(true);
                  }}
                >
                  <span style={{ fontSize: '3rem' }}>
                    <strong>+</strong>
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {isModalOpen && (
          <div
            className="modal show"
            style={{ display: 'block' }}
            tabIndex="-1"
            aria-labelledby="exampleModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {isEditing ? 'Edit Dish' : 'Add New Dish'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setIsModalOpen(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="form-group mb-3">
                    <label>Dish Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newDish.name}
                      onChange={(e) =>
                        setNewDish({ ...newDish, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group mb-3">
                    <label>Price</label>
                    <input
                      type="number"
                      className="form-control"
                      value={newDish.price}
                      onChange={(e) =>
                        setNewDish({ ...newDish, price: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group mb-3">
                    <label>Description</label>
                    <textarea
                      className="form-control"
                      value={newDish.description}
                      onChange={(e) =>
                        setNewDish({ ...newDish, description: e.target.value })
                      }
                    ></textarea>
                  </div>
                  <div className="form-group mb-3">
                    <label>Type</label>
                    <div className="form-check">
                      <input
                        type="radio"
                        className="form-check-input"
                        id="veg"
                        name="dishType"
                        value="veg"
                        checked={newDish.veg === 'veg'}
                        onChange={(e) =>
                          setNewDish({ ...newDish, veg: e.target.value })
                        }
                      />
                      <label className="form-check-label" htmlFor="veg">
                        Veg
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        type="radio"
                        className="form-check-input"
                        id="nonveg"
                        name="dishType"
                        value="non-veg"
                        checked={newDish.veg === 'non-veg'}
                        onChange={(e) =>
                          setNewDish({ ...newDish, veg: e.target.value })
                        }
                      />
                      <label className="form-check-label" htmlFor="nonveg">
                        Non-Veg
                      </label>
                    </div>
                  </div>

                  <div className="form-group mb-3">
                    <label>Image URL</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newDish.photoUrl}
                      onChange={(e) =>
                        setNewDish({ ...newDish, photoUrl: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  {isEditing && (
                    <button
                      className="btn btn-danger"
                      onClick={handleDeleteDish}
                    >
                      Delete
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleAddOrUpdateDish}
                  >
                    {isEditing ? 'Update' : 'Add'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

