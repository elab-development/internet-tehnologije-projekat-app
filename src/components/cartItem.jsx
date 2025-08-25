import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './css/cartitem.css';
import { Link } from 'react-router-dom';

function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingItems, setDeletingItems] = useState(new Set());

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await axios.get('http://localhost:8000/api/cart-items', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setItems(response.data.cart_items);
      } catch (error) {
        console.error('Error fetching cart items:', error.response ? error.response.data : error);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  const handleDelete = async (id) => {
    setDeletingItems(prev => new Set([...prev, id]));
    try {
      const token = localStorage.getItem('auth_token');
      await axios.delete(`http://localhost:8000/api/cart-items/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting cart item:', error.response ? error.response.data : error);
    } finally {
      setDeletingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="cart-container">
        <div className="loading-skeleton">
          <div className="skeleton-header"></div>
          <div className="skeleton-items">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton-item">
                <div className="skeleton-image"></div>
                <div className="skeleton-content">
                  <div className="skeleton-title"></div>
                  <div className="skeleton-text"></div>
                  <div className="skeleton-button"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="cart-container">
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Discover delicious recipes to add to your collection</p>
          <Link to="/recipes" className="browse-recipes-btn">
            Browse Recipes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>My Recipe Collection</h1>
        <div className="cart-stats">
          <span className="item-count">{items.length} {items.length === 1 ? 'recipe' : 'recipes'}</span>
        </div>
      </div>
      
      <div className="cart-content">
        <div className="cart-items">
          {items.map(item => (
            <div key={item.id} className={`cart-item ${deletingItems.has(item.id) ? 'deleting' : ''}`}>
              <Link to={`/recipe/${item.recipe.id}`} className="recipe-link">
                <div className="recipe-image-container">
                  <img 
                    src={`http://localhost:8000/storage/${item.recipe.slika}`} 
                    alt={item.recipe.name}
                    className="recipe-image"
                  />
                  <div className="recipe-overlay">
                    <span className="view-recipe">View Recipe</span>
                  </div>
                  <button 
                    className="remove-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(item.id);
                    }}
                    disabled={deletingItems.has(item.id)}
                    title="Remove from collection"
                  >
                    {deletingItems.has(item.id) ? (
                      <div className="loading-spinner"></div>
                    ) : (
                      <svg className="trash-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                      </svg>
                    )}
                  </button>
                </div>
                
                <div className="recipe-info">
                  <h3 className="recipe-title">{item.recipe.name}</h3>
                  <div className="recipe-meta">
                    <div className="prep-time">
                      <svg className="time-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z" />
                      </svg>
                      <span>{item.recipe.prep_time} min</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Cart;
