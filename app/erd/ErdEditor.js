// erd/ErdEditor.js
import React, { useEffect, useRef, useState } from "react";
import JointJSEditor from "./JointJSEditor";
import { exportGraph } from "./JointJSEditor";
import OntologyModal from "./OntologyModal";
import InfoModal from "./InfoModal";
import { Container, Row, Col, Button, Modal, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
const ErdEditor = () => {
  const workspaceRef = useRef(null);
  const [editor, setEditor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentElement, setCurrentElement] = useState(null);
  const [showOntologyModal, setShowOntologyModal] = useState(false);
  const [elements, setElements] = useState([]); // To store elements
  const [selectedElementId, setSelectedElementId] = useState('');


  useEffect(() => {
    if (workspaceRef.current && !editor) {
      const editorInstance = JointJSEditor(
        workspaceRef.current,
        handleElementDoubleClick
      );
      setEditor(editorInstance);
      editorInstance.graph.on('add remove', () => {
        const elements = editorInstance.graph.getElements().map((el) => ({ id: el.id, name: el.attr('text/text') || 'Unnamed' }));
        setElements(elements);
      });
      const updateElementsList = () => {
        const elements = editorInstance.graph.getElements().map(el => ({
          id: el.id,
          name: el.attr('text/text') || `Unnamed ${el.get('type')}` 
        }));
        setElements(elements);
      };
      editorInstance.graph.on('add remove change:attrs', updateElementsList);

      updateElementsList();
    }
  }, [editor]);

  const handleElementDoubleClick = (cellView) => {
    setCurrentElement(cellView.model);
    setIsModalOpen(true);
  };

  const handleModalSubmit = ({ name, description }) => {
    if (currentElement) {
      currentElement.attr("text/text", name);
      currentElement.prop("description", description);
      setIsModalOpen(false); 
      
    }
    setIsModalOpen(false);
  };

  const handleFileRead = async (e) => {
    const content = e.target.result;
    const graphJson = JSON.parse(content);
  
    if (editor && editor.graph) {
      try {
        editor.graph.fromJSON(graphJson);
        console.log("Graph imported successfully.");
        // Update elements list after importing graph
        const importedElements = editor.graph.getElements().map((el) => ({
          id: el.id, 
          name: el.attr('text/text') || `Unnamed ${el.get('type')} ${el.id.substring(0, 8)}`, 
        }));
        setElements(importedElements);
      } catch (error) {
        console.error("Error importing graph:", error);
      }
    }
  };

  const handleFileChosen = (file) => {
    let fileReader = new FileReader();
    fileReader.onloadend = handleFileRead;
    fileReader.readAsText(file);
  };

  return (
    <div className="container-fluid h-100">
      <div className="row">
        {/* Button and File Input Area */}
        <div className="col-12">
          
        <Form.Select aria-label="Select element to remove" onChange={(e) => setSelectedElementId(e.target.value)} value={selectedElementId}>
  <option>Select an element</option>
  {elements.map((element) => (
    <option key={element.id} value={element.id}>{element.name}</option>
  ))}
</Form.Select>
        <button onClick={() => setShowOntologyModal(true)} className="btn btn-primary m-1">Open Ontology Modal</button>
        <button onClick={() => editor?.removeElement(selectedElementId)} className="btn btn-danger m-1">Remove Selected Element</button>
          <button onClick={() => editor?.addElement("Entity")} className="btn btn-secondary m-1">Add Entity</button>
          <button onClick={() => editor?.addElement("Relationship")} className="btn btn-secondary m-1">Add Relationship</button>
          <button onClick={() => editor?.addElement("CustomShape")} className="btn btn-secondary m-1">Add Custom Shape</button>
          <button onClick={() => exportGraph(editor.graph)} className="btn btn-success m-1">Export ERD</button>
          <input type="file" accept=".json" onChange={(e) => handleFileChosen(e.target.files[0])} className="m-1"/>
        </div>
      </div>
      <div className="row h-100">
        {/* Workspace Area */}
        <div className="col-md-9 p-2" style={{ overflowY: 'auto' }}>
          <div ref={workspaceRef} style={{ height: '600px', background: '#f3f3f3' }}></div>
        </div>
        {/* Modals Area */}
        <div className="col-md-3 p-2" style={{ overflowY: 'auto', background: '#eaeaea' }}>
          {isModalOpen && (
            <InfoModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSubmit={handleModalSubmit}
              initialName={currentElement?.attr("text/text") || ""}
              initialDescription={currentElement?.prop("description") || ""}
            />
          )}
          {showOntologyModal && (
            <OntologyModal show={showOntologyModal} onClose={() => setShowOntologyModal(false)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ErdEditor;
