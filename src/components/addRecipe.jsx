import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './css/addRecipe.css'; // Import the regular CSS file
import CustomHtmlEditor from './customHtmlEditor';
import AdminNavBar from './adminNavBar';
import ImageSelectionModal from './imageSelectionModal';

const AddRecipe = () => {
  const [recipe, setRecipe] = useState({
    name: '',
    description: '',
    prep_time: '',
    slika: '',
    ingredients: [],
    opis: '',
    sku: '',
    stock: true, // Default to true
    price: '',
  });
  const uploadUrl = "api/upload-image";
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [ingredientQuantity, setIngredientQuantity] = useState('');
  const [selectedImagePath, setSelectedImagePath] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await axios.get('api/ingredients');
        if (response.data && Array.isArray(response.data.data)) {
          setAvailableIngredients(response.data.data);
        } else {
          console.error('Expected an array of ingredients but received:', response.data);
        }
      } catch (error) {
        console.error('Error fetching ingredients:', error);
      }
    };

    fetchIngredients();
  }, []);

  const setOpis = (value) => {
    setRecipe((prevRecipe) => ({
      ...prevRecipe,
      opis: value,
    }));
  };

  const setShortDescription = (value) => {
    setRecipe((prevRecipe) => ({
      ...prevRecipe,
      description: value,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipe((prevRecipe) => ({
      ...prevRecipe,
      [name]: value,
    }));
  };

  const addIngredient = () => {
    if (selectedIngredientId && ingredientQuantity) {
      setRecipe((prevRecipe) => ({
        ...prevRecipe,
        ingredients: [
          ...prevRecipe.ingredients,
          { id: selectedIngredientId, quantity: ingredientQuantity },
        ],
      }));

      setSelectedIngredientId('');
      setIngredientQuantity('');
    }
  };

  const removeIngredient = (index) => {
    const newIngredients = recipe.ingredients.filter((_, i) => i !== index);
    setRecipe((prevRecipe) => ({
      ...prevRecipe,
      ingredients: newIngredients,
    }));
  };

  const handleImageSelect = (imagePath) => {
    setSelectedImagePath(imagePath);
    setRecipe((prevRecipe) => ({
      ...prevRecipe,
      slika: imagePath,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', recipe.name);
    formData.append('description', recipe.description);
    formData.append('prep_time', recipe.prep_time);
    formData.append('opis', recipe.opis);
    formData.append('slika', recipe.slika); // Now this is the image path, not a file
    formData.append('sku', recipe.sku);
    formData.append('stock', recipe.stock ? 1 : 0); // Ensure stock is sent as 1 (true) or 0 (false)
    formData.append('price', recipe.price);

    recipe.ingredients.forEach((ingredient, index) => {
        formData.append(`ingredients[${index}][id]`, ingredient.id);
        formData.append(`ingredients[${index}][quantity]`, ingredient.quantity);
    });

    try {
        const response = await axios.post('api/recipes', formData, {
            headers: {
                Authorization: `Bearer ${window.localStorage.getItem('auth_token')}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log('Recipe created:', response.data);
        alert('Recipe created successfully!');
        // Reset form
        setRecipe({
          name: '',
          description: '',
          prep_time: '',
          slika: '',
          ingredients: [],
          opis: '',
          sku: '',
          stock: true,
          price: '',
        });
        setSelectedImagePath('');
    } catch (error) {
        console.error('Error creating recipe:', error.response?.data || error.message);
        alert('Error creating recipe');
    }
};


  return (
    <div className="admin-dashboard">
      <AdminNavBar />
     
      <form onSubmit={handleSubmit} className="recipeForm">
        <div className="formLayout">
          <div className="leftColumn">
          <h2>Add a New Recipe</h2>
            <input
              type="text"
              name="name"
              value={recipe.name}
              onChange={handleChange}
              placeholder="Recipe Name"
              required
              className="inputField"
              style={{ marginBottom: '40px' }} 
            />
            <h2>Short description</h2>
            <CustomHtmlEditor 
              onChange={setShortDescription} 
              uploadUrl={uploadUrl} 
              height="130px"
              style={{ marginBottom: '40px'}} 
            />  
            <h2>Product description</h2>   
            <CustomHtmlEditor 
              onChange={setOpis} 
              uploadUrl={uploadUrl} 
              height="400px"
              style={{ marginBottom: '20px' }} 
            />
            <input
              type="text"
              name="sku"
              value={recipe.sku}
              onChange={handleChange}
              placeholder="SKU (optional)"
              className="inputField"
              style={{marginTop:"30px"}}
            />
            <input
              type="number"
              name="price"
              value={recipe.price}
              onChange={handleChange}
              placeholder="Price"
              className="inputField"
              style={{marginTop:"5px"}}
            />
            <label>
              <input
                type="checkbox"
                name="stock"
                checked={recipe.stock}
                onChange={(e) => setRecipe({ ...recipe, stock: e.target.checked })}
              />
              In Stock
            </label>
            <h3>Ingredients</h3>
            <select
              value={selectedIngredientId}
              onChange={(e) => setSelectedIngredientId(e.target.value)}
              className="ingredientSelect"
            >
              <option value="">Select an ingredient</option>
              {availableIngredients.map((ingredient) => (
                <option key={ingredient.id} value={ingredient.id}>
                  {ingredient.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={ingredientQuantity}
              onChange={(e) => setIngredientQuantity(e.target.value)}
              placeholder="Quantity"
              className="inputField"
            />
            <button type="button" onClick={addIngredient} className="addIngredientButton">Add Ingredient</button>
            <div className="ingredientsList">
              {recipe.ingredients.map((ingredient, index) => {
                const ingredientName = availableIngredients.find(ing => ing.id === Number(ingredient.id))?.name;
                return (
                  <div key={index} className="ingredientRow">
                    <span>{ingredientName ? `${ingredientName} - ${ingredient.quantity}` : 'Unknown Ingredient'}</span>
                    <button type="button" onClick={() => removeIngredient(index)} className="removeButton">Remove</button>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rightColumn">
            <h3>Product Image</h3>
            <button 
              type="button"
              onClick={() => setShowImageModal(true)}
              className="selectImageButton"
              style={{
                padding: '10px 20px',
                border: '2px dashed #ccc',
                backgroundColor: '#fafafa',
                borderRadius: '8px',
                cursor: 'pointer',
                width: '100%',
                marginBottom: '10px'
              }}
            >
              {selectedImagePath ? 'Change Image' : 'Select Image from Library'}
            </button>
            {selectedImagePath && (
              <div className="imagePreview">
                <h4>Selected Image:</h4>
                <img 
                  src={`http://localhost:8000/${selectedImagePath}`} 
                  alt="Selected Recipe" 
                  className="image" 
                  style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' }}
                />
              </div>
            )}
            <input
              type="number"
              name="prep_time"
              value={recipe.prep_time}
              onChange={handleChange}
              placeholder="Preparation Time (minutes)"
              required
              className="inputField"
              style={{marginTop:"10px"}}
            />
          </div>
        </div>
        <button type="submit" className="submitButton">Submit Recipe</button>
      </form>
      
      <ImageSelectionModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        onSelect={handleImageSelect}
      />
    </div>
  );
};

export default AddRecipe;