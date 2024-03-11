import React, { useEffect, useState, useRef } from "react";

const InfoModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialName,
  initialDescription,
  initialProperties = [],
}) => {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [properties, setProperties] = useState([...initialProperties]);

  const handlePropertyChange = (index, key, value) => {
    const updatedProperties = properties.map((prop, propIndex) =>
      propIndex === index ? { ...prop, [key]: value } : prop
    );
    setProperties(updatedProperties);
  };

  const addProperty = () => {
    setProperties([
      ...properties,
      { key: `Property ${properties.length + 1}`, value: "" },
    ]);
  };

  const handleSubmit = () => {
    onSubmit({ name, description, properties });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "20%",
        left: "30%",
        backgroundColor: "white",
        padding: "20px",
        zIndex: 1000,
      }}
    >
      <div>
        <label>Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label>Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      {properties.map((property, index) => (
        <div key={index}>
          <input
            type="text"
            placeholder="Key"
            value={property.key}
            onChange={(e) => handlePropertyChange(index, "key", e.target.value)}
          />
          <input
            type="text"
            placeholder="Value"
            value={property.value}
            onChange={(e) =>
              handlePropertyChange(index, "value", e.target.value)
            }
          />
        </div>
      ))}
      <button onClick={addProperty}>Add Property</button>
      <button onClick={handleSubmit}>Submit</button>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default InfoModal;
