// ElementDetails.js
import React from "react";

const ElementDetails = ({ element }) => {
  if (!element) {
    return <div>Select an element to see its details</div>;
  }

  return (
    <div>
      <h5>Details</h5>
      <p>Name: {element.name}</p>
      <p>Description: {element.description}</p>
      <div>
        <h6>Properties:</h6>
        {element.customProperties.map((prop, index) => (
          <p key={index}>
            {prop.key}: {prop.value}
          </p>
        ))}
      </div>
    </div>
  );
};

export default ElementDetails;
