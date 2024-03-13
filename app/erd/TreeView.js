// TreeView.js
import React from 'react';

const TreeView = ({ elements, onElementSelect }) => {
  return (
    <div>
      <h5>Element Tree</h5>
      {elements.map((element) => (
        <div 
          key={element.id} 
          style={{ paddingLeft: '20px', paddingTop: '5px', cursor: 'pointer' }}
          onClick={() => onElementSelect(element.id)}
        >
          {element.name}
        </div>
      ))}
    </div>
  );
};

export default TreeView;
