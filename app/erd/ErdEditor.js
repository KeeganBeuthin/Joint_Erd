// erd/ErdEditor.js
import React, { useEffect, useRef, useState } from "react";
import JointJSEditor from "./JointJSEditor";
import { exportGraph } from "./JointJSEditor";
import OntologyModal from "./OntologyModal";
import InfoModal from "./InfoModal";
import { Container, Row, Col, Button, Modal, Form, Tabs, Tab } from "react-bootstrap"; 
import "bootstrap/dist/css/bootstrap.min.css";
import TreeView from "./TreeView";
import ElementDetails from "./ElementDetails";

const ErdEditor = () => {
  const workspaceRef = useRef(null);
  const [editor, setEditor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentElementId, setCurrentElementId] = useState(null);
  const [showOntologyModal, setShowOntologyModal] = useState(false);
  const [elements, setElements] = useState([]);
  const [selectedElementId, setSelectedElementId] = useState("");
  const [customProperties, setCustomProperties] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [editors, setEditors] = useState([{ id: 'editor-0', instance: null, elements: [] }]);
  const [activeTab, setActiveTab] = useState('editor-0');
  const editorRefs = useRef({});

  useEffect(() => {
    const firstEditorId = 'editor-0';
    if (!editorRefs.current[firstEditorId]) {
      editorRefs.current[firstEditorId] = React.createRef();
    }
    if (editorRefs.current[firstEditorId].current && !editors[0].instance) {
      const newEditor = JointJSEditor(
        editorRefs.current[firstEditorId].current,
        handleElementDoubleClick,
        handleElementClick
      );
      setEditors([{ id: 'editor-0', instance: newEditor, elements: [] }]);
    }
  }, [editors]);



  const addTab = () => {
    const newTabId = `editor-${editors.length}`;
    setEditors([...editors, { id: newTabId, instance: null, elements: [] }]);
    setActiveTab(newTabId);
    // Initialize a new editor for the new tab after render
    setTimeout(() => initializeEditorForTab(newTabId), 0);
  };


  const initializeEditorForTab = (tabId) => {
    if (!editorRefs.current[tabId]) {
      editorRefs.current[tabId] = React.createRef();
    }
    const container = editorRefs.current[tabId].current;
    if (container && !editors.find(editor => editor.id === tabId).instance) {
      const editorInstance = JointJSEditor(
        container,
        handleElementDoubleClick,
        handleElementClick
      );
      setEditors(editors.map(editor =>
        editor.id === tabId ? { ...editor, instance: editorInstance } : editor
      ));
    }
  };


  const updateElementsList = (editorInstance) => {
    const updatedElements = editorInstance.graph.getElements().map((el) => ({
      id: el.id,
      name: el.attr("text/text") || `Unnamed ${el.get("type")}`,
    }));
    setElements(updatedElements);
  };

  const handleElementDoubleClick = (cellView) => {
    const element = cellView.model;
    setCurrentElementId(element.id);
    setCustomProperties(element.prop("customProperties") || []);
    setIsModalOpen(true);
  
    // You might need to adjust this further based on how your app and JointJSEditor handle double clicks
  };

  const handleModalSubmit = ({ name, description, properties }) => {
    const activeEditor = editors.find(editor => editor.id === activeTab)?.instance;
    if (currentElementId && activeEditor) {
      const element = activeEditor.graph.getCell(currentElementId);
      if (element) {
        element.attr("text/text", name);
        element.prop("description", description);
        element.prop("customProperties", properties);
      }
    }
    setIsModalOpen(false);
  };

  const handleElementClick = (elementId) => {
    const activeEditor = editors.find(editor => editor.id === activeTab)?.instance;
    if (activeEditor) {
      // Assuming a function like this exists in your JointJSEditor to handle click events
      activeEditor.handleElementClick(elementId);
    }
  };

  const handleCreateLinks = () => {
    const activeEditor = editors.find(editor => editor.id === activeTab)?.instance;
    if (activeEditor) {
      activeEditor.createLinksForSharedProperties();
    }
  };
  
  const handleFileRead = async (e) => {
    const content = e.target.result;
    const graphJson = JSON.parse(content);
    const activeEditor = editors.find(editor => editor.id === activeTab)?.instance;
  
    if (activeEditor && activeEditor.graph) {
      try {
        activeEditor.graph.fromJSON(graphJson);
        console.log("Graph imported successfully.");
        // After importing, you might need to update the UI to reflect the new elements
        updateElementsList(activeEditor); // Assuming updateElementsList is adjusted to work with the active editor
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

  const handleElementSelect = (elementId) => {
    setSelectedElementId(elementId);

    const element = editor.graph.getCell(elementId);
    if (element) {
      element.on(
        "change:attrs change:description change:customProperties",
        () => {
          setSelectedElementId(elementId + "?update=" + Math.random());
        }
      );
    }
  };

  const renderSelectedElementDetails = () => {
    const element = selectedElementId
      ? editor.graph.getCell(selectedElementId.split("?")[0])
      : null;
    if (element) {
      const elementDetails = {
        id: element.id,
        name: element.attributes.attrs.text.text,
        description: element.attributes.description,
        customProperties: element.attributes.customProperties || [],
      };
      return <ElementDetails element={elementDetails} />;
    }
    return <ElementDetails element={null} />;
  };

  const addElementToActiveGraph = (elementType) => {
    const activeEditor = editors.find(editor => editor.id === activeTab)?.instance;
    if (activeEditor) {
      activeEditor.addElement(elementType);
    }
  };

  const exportActiveGraph = () => {
    const activeEditor = editors.find(editor => editor.id === activeTab)?.instance;
    if (activeEditor && activeEditor.graph) {
      exportGraph(activeEditor.graph);
    }
  };
 
  const renderTabs = () => {
    return (
      <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-3">
        {editors.map((editor, index) => (
          <Tab eventKey={editor.id} title={`Graph ${index + 1}`} key={editor.id}>
            <div ref={editorRefs.current[editor.id]} style={{ height: "600px", background: "#f3f3f3" }}></div>
          </Tab>
        ))}
      </Tabs>
    );
  };

  return (
    <div className="container-fluid h-100">
      <div className="row">
        <div className="col-12">
        <Button onClick={addTab} className="m-1">Add New Tab</Button>
          <button onClick={handleCreateLinks} className="btn btn-primary m-1">
            Create Links Based on Shared Properties
          </button>
          <button
            onClick={() => setShowOntologyModal(true)}
            className="btn btn-primary m-1"
          >
            Open Ontology Modal
          </button>
          <button
            onClick={() => editor?.removeElement(selectedElementId)}
            className="btn btn-danger m-1"
          >
            Remove Selected Element
          </button>
          <button
            onClick={() => addElementToActiveGraph("Entity")}
            className="btn btn-secondary m-1"
          >
            Add Entity
          </button>
          <button
            onClick={() => addElementToActiveGraph("Relationship")}
            className="btn btn-secondary m-1"
          >
            Add Relationship
          </button>
          <button
            onClick={() => addElementToActiveGraph("CustomShape")}
            className="btn btn-secondary m-1"
          >
            Add Custom Shape
          </button>
          <button
           onClick={exportActiveGraph}
            className="btn btn-success m-1"
          >
            Export ERD
          </button>
          <input
            type="file"
            accept=".json"
            onChange={(e) => handleFileChosen(e.target.files[0])}
            className="m-1"
          />
        </div>
      </div>
     
      <div className="row h-100">
        
        <div
          className="col-md-2 p-2"
          style={{ overflowY: "auto", background: "#eaeaea" }}
        >
         
          <TreeView
            elements={elements}
            onElementSelect={handleElementSelect}
            selectedElementId={selectedElementId}
          />
         
        </div>
        
        <div className="col-md-7 p-2" style={{ overflowY: "auto" }}>
        {renderTabs()}
          <div
            ref={workspaceRef}
            style={{ height: "600px", background: "#f3f3f3" }}
          ></div>
        </div>
        
        <div
          className="col-md-3 p-2"
          style={{ overflowY: "auto", background: "#eaeaea" }}
        >
          {renderSelectedElementDetails()}
        </div>
        {isModalOpen && (
          <InfoModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleModalSubmit}
            initialName={
              editor?.graph.getCell(currentElementId)?.attr("text/text") || ""
            }
            initialDescription={
              editor?.graph.getCell(currentElementId)?.prop("description") || ""
            }
            initialProperties={customProperties}
          />
        )}
        {showOntologyModal && (
          <OntologyModal
            show={showOntologyModal}
            onClose={() => setShowOntologyModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ErdEditor;
