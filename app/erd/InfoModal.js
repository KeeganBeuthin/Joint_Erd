import React, { useEffect, useState, useRef } from "react";
import { Modal, Button, Form } from "react-bootstrap";
const InfoModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialName,
  initialDescription,
  initialProperties = [],
  position,
}) => {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [properties, setProperties] = useState([...initialProperties]);
  const modalRef = useRef(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      const modalRect = modalRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      if (position.x + modalRect.width > viewportWidth) {
        setAdjustedPosition({
          ...position,
          x: viewportWidth - modalRect.width - 20,
        });
      }
    }
  }, [isOpen, position]);

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
    <Modal
      show={isOpen}
      onHide={onClose}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Edit Information
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="formName">
            <Form.Label>Name:</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formDescription">
            <Form.Label>Description:</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>
          {properties.map((property, index) => (
            <div key={index} className="mb-3">
              <Form.Control
                className="mb-2"
                type="text"
                placeholder="Key"
                value={property.key}
                onChange={(e) =>
                  handlePropertyChange(index, "key", e.target.value)
                }
              />
              <Form.Control
                type="text"
                placeholder="Value"
                value={property.value}
                onChange={(e) =>
                  handlePropertyChange(index, "value", e.target.value)
                }
              />
            </div>
          ))}
          <Button variant="secondary" onClick={addProperty} className="me-2">
            Add Property
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default InfoModal;
