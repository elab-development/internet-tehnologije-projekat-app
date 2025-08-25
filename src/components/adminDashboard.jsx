import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './css/adminDashboard.css';
import AdminNavBar from './adminNavBar';
import { useAuth } from '../authContext'; // Import the useAuth hook

function AdminDashboard() {
  const { token, isModeratorOrAdmin, setIsAdmin, setRole } = useAuth(); // Get isModeratorOrAdmin and role functions from context
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!isModeratorOrAdmin) {
        try {
          const response = await axios.get('/api/user', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setIsAdmin(response.data.is_admin); 
          setRole(response.data.role);
          // Update role based on the response
          if (response.data.role !== 'admin' && response.data.role !== 'moderator') {
            navigate('/recipes'); // Redirect if not admin or moderator
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          navigate('/recipes'); // Redirect if unable to fetch user data
        }
      }
    };

    checkUserRole();

    // Fetch recipes (GET all recipes when visiting "Products" page)
    const fetchRecipes = async () => {
      try {
        const response = await axios.get('/api/recipes/all');
        setRecipes(response.data.data); 
      } catch (error) {
        console.error('Error fetching recipes:', error);
      }
    };

    fetchRecipes();
  }, [isModeratorOrAdmin, navigate, token, setIsAdmin, setRole]);

  

  return (
    <div className="admin-dashboard">
      <AdminNavBar/>

      <div className="content">
        <h2>All Recipes</h2>
        <ul>
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              {recipe.name} - <Link to={`/admin/edit-recipe/${recipe.id}`} className="edit-link">Izmeni</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AdminDashboard;