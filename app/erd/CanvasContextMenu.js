import React, { useEffect, useRef }  from 'react';
import { Dropdown } from 'react-bootstrap';

const CanvasContextMenu = ({ visible, position, onSelect, onHide }) => {

  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onHide();
      }
    };

    if (visible) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [visible, onHide]); 

  if (!visible) return null;

  return (
    <div ref={menuRef} style={{ position: 'fixed', top: position.y, left: position.x, zIndex: 1000 }}>
      <Dropdown.Menu show={true}>
        <Dropdown.Item onClick={() => onSelect('paste')}>Paste</Dropdown.Item>
        <Dropdown.Item onClick={() => onSelect('relationship')}>Add Relationship</Dropdown.Item>
        <Dropdown.Item onClick={() => onSelect('customshape')}>Add Custom Shape</Dropdown.Item>
        <Dropdown.Item onClick={() => onSelect('entity')}>Add Entity</Dropdown.Item>
        <Dropdown.Item onClick={() => onSelect('link')}>Create Links</Dropdown.Item>
        {/* Add other canvas-specific options here */}
      </Dropdown.Menu>
    </div>
  );
};

export default CanvasContextMenu;
