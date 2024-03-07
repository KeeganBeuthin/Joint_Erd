// SimpleModal.js
import React from 'react';

const InfoModal = ({ isOpen, onClose, onSubmit, initialName = '', initialDescription = '' }) => {
  const [name, setName] = React.useState(initialName);
  const [description, setDescription] = React.useState(initialDescription);

  const handleSubmit = () => {
    onSubmit({ name, description });
    onClose(); // Close the modal after submitting
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: '20%', left: '30%', backgroundColor: 'white', padding: '20px', zIndex: 1000 }}>
      <div>
        <label>Name:</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label>Description:</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <button onClick={handleSubmit}>Submit</button>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default InfoModal;
