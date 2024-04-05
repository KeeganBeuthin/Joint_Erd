import React from 'react';
import { Dropdown } from 'react-bootstrap';

const ContextMenu = ({ visible, position, onSelect }) => {
  if (!visible) return null;

  // Inline styles for the Dropdown menu
  const menuStyle = {
    position: 'fixed',
    top: position.y,
    left: position.x,
    zIndex: 1000
  };

  return (
 <Dropdown.Menu show={true} style={{ position: 'fixed', top: position.y, left: position.x, zIndex: 1000 }}>
      <Dropdown.Item onClick={() => onSelect('delete')}>Delete</Dropdown.Item>
      <Dropdown.Item onClick={() => onSelect('copy')}>Copy</Dropdown.Item>
      {/* Add more Dropdown.Items as needed */}
    </Dropdown.Menu>
  );
};
  

export default ContextMenu;
