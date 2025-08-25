import React from "react";
import "./css/jednojelo.css";
import { useNavigate } from 'react-router-dom';
import { FaCartPlus } from "react-icons/fa";
import { ImArrowUpRight2 } from "react-icons/im";
import axios from 'axios';

const JednoJelo = ({recipe}) => {
  const navigate = useNavigate();
  const baseURL = 'http://localhost:8000/';

  const handleClick = () => {
    navigate(`/recipe/${recipe.id}`);
  };

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.post(
        '/api/cart-items',
        { recipe_id: recipe.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data.message);
    } catch (error) {
      console.error('Error adding to cart:', error.response ? error.response.data : error);
    }
  };

  return (
    <div className="card" style={{ margin: 25 }}>
      <div className="image-container">
        <img className="card-img-top" src={`${baseURL}storage/${recipe.slika}`} alt={recipe.name} /> 
        <button className="addToCart-overlay" onClick={handleAddToCart}>
          <FaCartPlus />
        </button>
        <button className="buttonRecipe-overlay" onClick={handleClick}>
          <ImArrowUpRight2 />
          <span>View Recipe</span>
        </button>
      </div>
      <div className="card-body">
        <h3 className="card-title">{recipe.name}</h3>
        <div className="card-text">
          <div className="prep-time">
            <svg className="time-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z" />
            </svg>
            <span>{recipe.prep_time} min</span>
          </div>
          <ul className="sastojci">
            {recipe.ingredients.map((sastojak) => (
              <li key={sastojak.id}>{sastojak.name}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JednoJelo;