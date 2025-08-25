import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AdminNavBar from './adminNavBar';
import './css/recipeList.css'; 
import { FaUser, FaSortUp, FaSortDown } from "react-icons/fa6";
import { useAuth } from '../authContext';

const UserList = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  useEffect(() => {
    if (!isAdmin) {
      setError("Access denied. Admin privileges required.");
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await axios.get(`/api/users?page=${currentPage}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
        });
        setUsers(response.data.data || []);
        setTotalPages(response.data.meta?.last_page || 1);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("There was an issue loading users.");
      }
    };

    fetchUsers();
  }, [currentPage, isAdmin]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleCheckboxChange = (userId) => {
    const newSelectedUsers = new Set(selectedUsers);
    if (newSelectedUsers.has(userId)) {
      newSelectedUsers.delete(userId);
    } else {
      newSelectedUsers.add(userId);
    }
    setSelectedUsers(newSelectedUsers);
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) {
      alert("No users selected for deletion.");
      return;
    }
    if (window.confirm('Are you sure you want to delete the selected users?')) {
      try {
        for (const userId of selectedUsers) {
          await axios.delete(`/api/users/${userId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
          });
        }
        alert('Selected users deleted successfully');
        setUsers(users.filter(user => !selectedUsers.has(user.id)));
        setSelectedUsers(new Set());
      } catch (error) {
        console.error('Error deleting users:', error);
        alert('Error deleting some users');
      }
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`/api/users/${userId}`, 
        { role: newRole },
        { headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` } }
      );
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      alert('User role updated successfully');
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Error updating user role');
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/users/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
        });
        alert('User deleted successfully');
        setUsers(users.filter(user => user.id !== id));
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user');
      }
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    pageNumbers.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        className="pagination-arrow"
        disabled={currentPage === 1}
      >
        &lt;
      </button>
    );  
    
    if (totalPages > 1) {
      pageNumbers.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={1 === currentPage ? "active-page" : ""}
        >
          1
        </button>
      );

      if (currentPage > 3) {
        pageNumbers.push(<span key="dots-start">...</span>);
      }

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={i === currentPage ? "active-page" : ""}
          >
            {i}
          </button>
        );
      }
      
      if (currentPage < totalPages - 2) {
        pageNumbers.push(<span key="dots-end">...</span>);
      }

      if (totalPages > 1) {
        pageNumbers.push(
          <button
            key={totalPages}
            onClick={() => handlePageChange(totalPages)}
            className={totalPages === currentPage ? "active-page" : ""}
          >
            {totalPages}
          </button>
        );
      }
    }

    pageNumbers.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        className="pagination-arrow"
        disabled={currentPage === totalPages}
      >
        &gt;
      </button>
    );

    return pageNumbers;
  };

  if (error) {
    return (
      <div className="admin-dashboard">
        <AdminNavBar />
        <div className="content">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <AdminNavBar />
      <div className="content">
        <h2>All Users</h2>
        <button onClick={handleBulkDelete} className="delete-button">Delete Selected</button>

        <div className="paginationn">
            {renderPageNumbers()}
        </div>
        
        <table className="recipe-table">
          <thead>
            <tr>
              <th>
                <span onClick={() => {
                  if (selectedUsers.size === users.length) {
                    setSelectedUsers(new Set());
                  } else {
                    setSelectedUsers(new Set(users.map(user => user.id)));
                  }
                }}>
                  <input type="checkbox" checked={selectedUsers.size === users.length} readOnly />
                </span>
              </th>
              <th><FaUser /></th>
              <th onClick={() => handleSort('name')}>
                Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
              </th>
              <th onClick={() => handleSort('email')}>
                Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
              </th>
              <th onClick={() => handleSort('role')}>
                Role {sortConfig.key === 'role' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
              </th>
              <th onClick={() => handleSort('created_at')}>
                Date Created {sortConfig.key === 'created_at' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user) => (
              <tr key={user.id} className="recipe-row">
                <td>
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.id)}
                    onChange={() => handleCheckboxChange(user.id)}
                  />
                </td>
                <td>
                  <FaUser className="user-icon" />
                </td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role || 'user'}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="role-select"
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                  <button 
                    className="delete-button" 
                    onClick={() => handleDelete(user.id)}
                    style={{ fontSize: '12px', padding: '4px 8px' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="paginationn">
            {renderPageNumbers()}
        </div>
      </div>
    </div>
  );
};

export default UserList;