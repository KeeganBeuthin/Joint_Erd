// erd/JointJSEditor.js
import * as joint from 'jointjs';
import React, { useEffect, useRef, useState } from 'react';


export const exportGraph = (graph) => {
    if (!graph) {
        console.error('No graph instance provided for export.');
        return;
      }
    const graphJson = graph.toJSON();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(graphJson));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "erd.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }



  const JointJSEditor = (container) => {
    // Initialize the graph with cellNamespace pointing to joint.shapes
    var graph = new joint.dia.Graph({}, { cellNamespace: joint.shapes });
    var paper = new joint.dia.Paper({
      el: container,
      model: graph,
      width: '100%',
      height: '600px',
      gridSize: 10,
      background: {
        color: 'rgba(0, 255, 0, 0.3)',
      },
    });
  
    const createCustomShape = (position, size, label) => {
      const customShape = new joint.shapes.basic.Rect({
        position,
        size,
        attrs: {
          rect: { fill: 'green' },
          text: { text: label, fill: 'white' },
        },
      });
    
      customShape.on('element:pointerclick', () => {
        // Open modal logic here
        console.log('Custom shape clicked!');
      });
    
      return customShape;
    };
    

    const addElement = (type) => {
      let element;
    
      if (type === 'Entity') {
        element = new joint.shapes.basic.Rect({
          position: { x: 100, y: 100 },
          size: { width: 100, height: 30 },
          attrs: { rect: { fill: 'blue' }, text: { text: 'Entity', fill: 'white' } },
        });
      } else if (type === 'Relationship') {
        element = new joint.shapes.basic.Circle({
          position: { x: 300, y: 100 },
          size: { width: 50, height: 30 },
          attrs: { circle: { fill: 'red' }, text: { text: 'Rel', fill: 'white' } },
        });
      } else if (type === 'CustomShape') {
        element = createCustomShape({ x: 500, y: 100 }, { width: 150, height: 50 }, 'Custom Shape');
      }
    
      graph.addCell(element);
    };
  
    return { graph, addElement };
  };
  
  export default JointJSEditor;