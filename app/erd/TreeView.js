// TreeView.js
import React from 'react';

const TreeView = ({ elements, onElementSelect, selectedElementId }) => {
  return (
    <div>
      <h5>Element Tree</h5>
      {elements.map((element) => (
        <div 
          key={element.id} 
          style={{ 
            paddingLeft: '20px', 
            paddingTop: '5px', 
            cursor: 'pointer',
            fontWeight: selectedElementId === element.id ? 'bold' : 'normal',
            border: selectedElementId === element.id ? '1px solid black' : 'none',
            marginBottom: selectedElementId === element.id ? '5px' : '0', // Optional: Adds a bit of margin for elements with a border
          }}
          onClick={() => onElementSelect(element.id)}
        >
          {element.name}
        </div>
      ))}
    </div>
  );
};

export default TreeView;
