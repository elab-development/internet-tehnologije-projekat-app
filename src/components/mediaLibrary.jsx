import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminNavBar from './adminNavBar';
import { useDropzone } from 'react-dropzone';

const MediaLibrary = () => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [customName, setCustomName] = useState('');

  const fetchImages = async () => {
    console.log('Fetching images...'); // Debugging line
    try {
      const response = await axios.get('/api/media-library', {
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('auth_token')}`, // Include the token in the headers
        },
      });// Adjust the endpoint as needed
      console.log('Response from API:', response.data); // Log the response
      setImages(response.data.images); // Assuming the response contains an array of image URLs
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  console.log('Images state:', images); // Log the images state

  const uploadImage = async (file) => {
    if (!customName.trim()) {
      alert('Please enter a custom name for the image');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('custom_name', customName);

    try {
      const response = await axios.post('/api/upload-image', formData, {
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('auth_token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Image uploaded successfully:', response.data);
      setCustomName('');
      // Refresh the images list
      fetchImages();
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        uploadImage(acceptedFiles[0]);
      }
    },
  });

  return (
    <div className="admin-dashboard">
      <AdminNavBar />
      <h2>Media Libraryy</h2>
      
      {/* Upload Section */}
      <div className="upload-section" style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>Upload New Image</h3>
        <input
          type="text"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          placeholder="Enter image name"
          style={{ marginBottom: '10px', padding: '8px', width: '300px' }}
        />
        <div {...getRootProps()} style={{
          border: '2px dashed #ccc',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragActive ? '#f0f8ff' : '#fafafa'
        }}>
          <input {...getInputProps()} />
          {uploading ? (
            <p>Uploading...</p>
          ) : isDragActive ? (
            <p>Drop the image here...</p>
          ) : (
            <p>Drag & drop an image here, or click to select one</p>
          )}
        </div>
      </div>

      {/* Images Grid */}
      <div className="image-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
        {images.map((image, index) => (
          <div key={index} className="image-item" style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
            <img 
              src={`http://localhost:8000/${image}`} 
              alt={`Uploaded ${index}`} 
              style={{ width: '100%', height: '150px', objectFit: 'cover' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaLibrary;