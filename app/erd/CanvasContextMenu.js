import React from 'react';
import { Dropdown } from 'react-bootstrap';

const CanvasContextMenu = ({ visible, position, onSelect, onHide }) => {
  if (!visible) return null;

  return (
    <div style={{ position: 'fixed', top: position.y, left: position.x, zIndex: 1000 }}>
      <Dropdown.Menu show={true}>
        <Dropdown.Item onClick={() => onSelect('paste')}>Paste</Dropdown.Item>
        {/* Add other canvas-specific options here */}
      </Dropdown.Menu>
    </div>
  );
};

export default CanvasContextMenu;
