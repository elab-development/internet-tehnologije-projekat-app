import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ImageSelectionModal = ({ isOpen, onClose, onSelect }) => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchImages();
    }
  }, [isOpen]);

  const fetchImages = async () => {
    try {
      const response = await axios.get('/api/media-library', {
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('auth_token')}`,
        },
      });
      setImages(response.data.images);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const handleSelectImage = () => {
    if (selectedImage) {
      onSelect(selectedImage);
      onClose();
      setSelectedImage('');
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '80%',
        maxHeight: '80%',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>Select an Image</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>
            ×
          </button>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
          gap: '10px',
          marginBottom: '20px'
        }}>
          {images.map((image, index) => (
            <div 
              key={index} 
              onClick={() => setSelectedImage(image)}
              style={{
                border: selectedImage === image ? '3px solid #007bff' : '1px solid #ddd',
                borderRadius: '8px',
                overflow: 'hidden',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <img 
                src={`http://localhost:8000/${image}`} 
                alt={`Image ${index}`} 
                style={{ width: '100%', height: '100px', objectFit: 'cover' }}
              />
              {selectedImage === image && (
                <div style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px'
                }}>
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button 
            onClick={onClose}
            style={{ 
              padding: '10px 20px', 
              border: '1px solid #ddd', 
              backgroundColor: 'white',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button 
            onClick={handleSelectImage}
            disabled={!selectedImage}
            style={{ 
              padding: '10px 20px', 
              border: 'none', 
              backgroundColor: selectedImage ? '#007bff' : '#ccc',
              color: 'white',
              borderRadius: '4px',
              cursor: selectedImage ? 'pointer' : 'not-allowed'
            }}
          >
            Select Image
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageSelectionModal;