import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './css/adminDashboard.css'; // Assuming the CSS is the same
import { FaBoxArchive, FaUsers } from "react-icons/fa6";
import { MdPermMedia } from "react-icons/md";
import { useAuth } from '../authContext';

const AdminNavBar = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();

  return (
    <nav className="sidebar">
      <h2>Dashboard</h2>
      <ul className="nav-links">
        <li className="nav-item dropdown">
          <Link 
            to="/admin/recipe-list" 
            className={`nav-link ${location.pathname === "/admin/recipe-list" ? "active" : ""}`}
          >
            <FaBoxArchive style={{ marginTop: "2px" }} /> Products
          </Link>
          <ul className="dropdown-content">
            <li>
              <Link 
                to="/admin/add-recipe" 
                className={`nav-linkk ${location.pathname === "/admin/add-recipe" ? "active" : ""}`}
              >
                Add product
              </Link>
            </li>
          </ul>
        </li>
        <li className="nav-item">
          <Link 
            to="/admin/media-library" 
            className={`nav-link ${location.pathname === "/admin/media-library" ? "active" : ""}`}
          >
            <MdPermMedia /> Media
          </Link>
        </li>
        {isAdmin && (
          <li className="nav-item">
            <Link 
              to="/admin/user-list" 
              className={`nav-link ${location.pathname === "/admin/user-list" ? "active" : ""}`}
            >
              <FaUsers /> Users
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default AdminNavBar;