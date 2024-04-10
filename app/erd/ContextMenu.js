import React, { useEffect, useRef } from 'react';
import { Dropdown } from 'react-bootstrap';

const ContextMenu = ({ visible, position, onSelect, onHide }) => {
  const menuRef = useRef(null);

  // Setup an effect for handling clicks outside the menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onHide(); // Call onHide prop when clicked outside
      }
    };

    // Add event listener when the menu is visible
    if (visible) {
      document.addEventListener('click', handleClickOutside);
    }

    // Cleanup the event listener
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [visible, onHide]); // Re-run this effect if 'visible' or 'onHide' changes

  if (!visible) return null;

  return (
    <div ref={menuRef} style={{ position: 'fixed', top: position.y, left: position.x, zIndex: 1000 }}>
      <Dropdown.Menu show={true}>
        <Dropdown.Item onClick={() => onSelect('delete')}>Delete</Dropdown.Item>
        <Dropdown.Item onClick={() => onSelect('copy')}>Copy</Dropdown.Item>
        <Dropdown.Item onClick={() => onSelect('paste')}>Paste</Dropdown.Item>
        {/* Add more Dropdown.Items as needed */}
      </Dropdown.Menu>
    </div>
  );
};


export default ContextMenu;
