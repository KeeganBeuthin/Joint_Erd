import React, { useEffect, useRef } from "react";
import { Dropdown } from "react-bootstrap";

const ContextMenu = ({ visible, position, onSelect, onHide }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onHide();
      }
    };

    if (visible) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [visible, onHide]);

  if (!visible) return null;

  return (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top: position.y,
        left: position.x,
        zIndex: 1000,
      }}
    >
      <Dropdown.Menu show={true}>
        <Dropdown.Item onClick={() => onSelect("delete")}>Delete</Dropdown.Item>
        <Dropdown.Item onClick={() => onSelect("copy")}>Copy</Dropdown.Item>
        {/* Add more Dropdown.Items as needed */}
      </Dropdown.Menu>
    </div>
  );
};

export default ContextMenu;
