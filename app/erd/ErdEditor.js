// erd/ErdEditor.js
import React, { useEffect, useRef, useState } from "react";
import JointJSEditor from "./JointJSEditor";
import { exportGraph } from "./JointJSEditor";
import OntologyModal from "./OntologyModal";
import InfoModal from "./InfoModal";
import ContextMenu from "./ContextMenu";
import * as joint from "jointjs";
import {
  Container,
  Row,
  Col,
  Button,
  Modal,
  Form,
  Tabs,
  Tab,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import TreeView from "./TreeView";
import ElementDetails from "./ElementDetails";
import CanvasContextMenu from "./CanvasContextMenu";

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
  const [copiedElement, setCopiedElement] = useState(null);
  const [editors, setEditors] = useState([
    { id: "editor-0", instance: null, elements: [] },
  ]);
  const [activeTab, setActiveTab] = useState("editor-0");
  const [elementsByTab, setElementsByTab] = useState({ "editor-0": [] });
  const [elementName, setElementName] = useState("default");
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [elementDescription, setElementDescription] = useState("default");
  const [canvasMenuState, setCanvasMenuState] = useState({
    visible: false,
    position: { x: 0, y: 0 }
  });
  
  const [contextMenuState, setContextMenuState] = useState({ 
    visible: false,
    position: { x: 0, y: 0 },
    targetElementId: null,
  });
  const editorRefs = useRef({});

  useEffect(() => {
    const initializeFirstEditor = () => {
      const firstEditorId = "editor-0";
      if (!editorRefs.current[firstEditorId]) {
        editorRefs.current[firstEditorId] = React.createRef();
      }
      if (editorRefs.current[firstEditorId].current && !editors[0]?.instance) {
        const newEditor = JointJSEditor(
          editorRefs.current[firstEditorId].current,
          handleElementDoubleClick,
          handleElementClick,
          handleElementRightClick,
          handleCanvasRightClick,
          handleCanvasDoubleClick
        );
        console.log("First editor initialized:", newEditor);
        setEditors([{ id: "editor-0", instance: newEditor, elements: [] }]);
      }
    };

    initializeFirstEditor();
  }, [editors]);

  useEffect(() => {
    console.log(`Active tab changed to: ${activeTab}`);
    const activeEditor = editors.find(
      (editor) => editor.id === activeTab
    )?.instance;
    if (activeEditor) {
      console.log("Updating elements list for active tab:", activeTab);
      updateElementsList(activeEditor, activeTab);
    }
  }, [activeTab, editors]);

  useEffect(() => {
    const tabId = activeTab;
    if (!editorRefs.current[tabId]) {
      editorRefs.current[tabId] = React.createRef();
    }
    const container = editorRefs.current[tabId]?.current;
    const editorForTab = editors.find((editor) => editor.id === tabId);
    if (container && !editorForTab?.instance) {
      const editorInstance = JointJSEditor(
        container,
        handleElementDoubleClick,
        handleElementClick,
        handleElementRightClick,
        handleCanvasRightClick
      );
      setEditors((prevEditors) =>
        prevEditors.map((editor) =>
          editor.id === tabId ? { ...editor, instance: editorInstance } : editor
        )
      );
      updateElementsList(editorInstance, tabId);
    }
  }, [activeTab, editors]);

  const addTab = () => {
    const newTabId = `editor-${editors.length}`;
    setEditors([...editors, { id: newTabId, instance: null, elements: [] }]);
    setActiveTab(newTabId);
  };

  const showContextMenu = (position) => {
    setContextMenuPosition(position);
    setContextMenuVisible(true);
  };

  const hideContextMenu = () => {
    setContextMenuVisible(false);
  };

  const handleSelectAction = (action) => {
    console.log(action);
    hideContextMenu();
  };

  const updateElementsList = (editorInstance, tabId) => {
    console.log(`Updating elements list for: ${tabId}`);
    if (!editorInstance) return;
    const updatedElements = editorInstance.graph.getElements().map((el) => ({
      id: el.id,
      name: el.attr("text/text") || `Unnamed ${el.get("type")}`,
    }));
    setElementsByTab((prev) => ({ ...prev, [tabId]: updatedElements }));
    console.log(`Elements updated for: ${tabId}`, updatedElements);
  };

  const handleElementDoubleClick = (cellView) => {
    console.log("Element double-clicked:", cellView.model.id);

    const element = cellView.model;
    if (!element) {
      console.log("Double-clicked element not found.");
      return;
    }

    const bbox = cellView.getBBox();
    const modalPosition = {
      x: bbox.x + bbox.width / 2,
      y: bbox.y + bbox.height / 2,
    };

    setCurrentElementId(element.id);
    setCustomProperties(element.prop("customProperties") || []);
    setElementName(element.attr("text/text") || "");
    setElementDescription(element.prop("description") || "");

    setModalPosition(modalPosition);

    setIsModalOpen(true);
  };

  const handleModalSubmit = ({ name, description, properties }) => {
    const activeEditor = editors.find(
      (editor) => editor.id === activeTab
    )?.instance;
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
    console.log("Element clicked:", elementId);
    setSelectedElementId(elementId);
  };

  const handleElementRightClick = (modelId, x, y) => {
    console.log('click')
    setContextMenuState({
      visible: true,
      position: { x, y },
      targetElementId: modelId,
    });
  };

  const handleCreateLinks = () => {
    const activeEditor = editors.find(
      (editor) => editor.id === activeTab
    )?.instance;
    if (activeEditor) {
      activeEditor.createLinksForSharedProperties();
    }
  };

  const handleFileRead = async (e) => {
    const content = e.target.result;
    const graphJson = JSON.parse(content);
    const activeEditor = editors.find(
      (editor) => editor.id === activeTab
    )?.instance;

    if (activeEditor && activeEditor.graph) {
      try {
        activeEditor.graph.fromJSON(graphJson);
        console.log("Graph imported successfully.");
        updateElementsList(activeEditor, activeTab);
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
    const activeEditor = editors.find(
      (editor) => editor.id === activeTab
    )?.instance;
    if (activeEditor) {
      setSelectedElementId(elementId);

      const element = activeEditor.graph.getCell(elementId);
      if (element) {
        element.on(
          "change:attrs change:description change:customProperties",
          () => {
            setSelectedElementId(elementId + "?update=" + Math.random());
          }
        );
      }
    }
  };
  
  const handleCanvasRightClick = (x, y) => {
    setCanvasMenuState({
      visible: true,
      position: { x, y }
    });
  };

  const handleCanvasDoubleClick = (x, y) => {
    if (!workspaceRef.current) return;

    const rect = workspaceRef.current.getBoundingClientRect(); 
  

    setCanvasMenuState({
      visible: true,
      position: { x, y}
    });
  };
  

  const handleCanvasMenuSelect = (action) => {
    if (action === "paste" && copiedElement) {
      // Get a reference to the active editor's graph
      const activeEditorGraph = editors.find(editor => editor.id === activeTab)?.instance.graph;
  
      if (activeEditorGraph) {
        const pastedElementData = JSON.parse(JSON.stringify(copiedElement)); // Deep copy to ensure no references are kept
        pastedElementData.id = joint.util.uuid(); // Assign a new ID to avoid conflicts
  
        // Optionally modify position or other attributes as necessary
        pastedElementData.position.x += 10; // Offset new element slightly for visibility
        pastedElementData.position.y += 10;
  
        const element = joint.dia.Element.define(pastedElementData.type, pastedElementData.attrs, {
          markup: pastedElementData.markup
        });
        
        const newElement = new element(pastedElementData);
  
        activeEditorGraph.addCell(newElement);
        updateElementsList(activeEditorGraph, activeTab); // Optionally update UI lists or other views
      }
    }
  
    setCanvasMenuState({ ...canvasMenuState, visible: false }); // Hide menu after action
  };

  const renderSelectedElementDetails = () => {
    const activeEditor = editors.find(
      (editor) => editor.id === activeTab
    )?.instance;
    if (!activeEditor) return <ElementDetails element={null} />;

    const element = selectedElementId
      ? activeEditor.graph.getCell(selectedElementId.split("?")[0])
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
    const activeEditor = editors.find(
      (editor) => editor.id === activeTab
    )?.instance;
    if (activeEditor) {
      activeEditor.addElement(elementType);
      updateElementsList(activeEditor, activeTab);
    }
  };

  const exportActiveGraph = () => {
    const activeEditor = editors.find(
      (editor) => editor.id === activeTab
    )?.instance;
    if (activeEditor && activeEditor.graph) {
      exportGraph(activeEditor.graph);
    }
  };

  const removeSelectedElementFromActiveGraph = () => {
    const activeEditor = editors.find(
      (editor) => editor.id === activeTab
    )?.instance;
    if (activeEditor && selectedElementId) {
      activeEditor.removeElement(selectedElementId);
      updateElementsList(activeEditor, activeTab);
      setSelectedElementId("");
      setElementName("default");
      setElementDescription("default");
    }
  };

  const handleSelect = (action) => {
    const activeEditor = editors.find((editor) => editor.id === activeTab)?.instance;
    if (!activeEditor || !contextMenuState.targetElementId) return;
  
    switch (action) {
      case "delete":
        activeEditor.removeElement(contextMenuState.targetElementId);
        updateElementsList(activeEditor, activeTab);
        setContextMenuState({ ...contextMenuState, visible: false });
        break;
      case "copy":
        const elementToCopy = activeEditor.graph.getCell(contextMenuState.targetElementId);
        if (elementToCopy) {
          setCopiedElement(elementToCopy.toJSON()); 
        }
        setContextMenuState({ ...contextMenuState, visible: false });
        break;

        case 'paste': 
        
        if (!copiedElement) return; 

        const activeEditor = editors.find((editor) => editor.id === activeTab)?.instance;
        if (!activeEditor) return;
      
        const newElement = {
          ...copiedElement,
          id: generateUniqueId(), 
        };
      
        activeEditor.addElement(newElement);
        break;
      
    }
  };
  

  const renderTabs = () => {
    return (
      <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-3">
        {editors.map((editor, index) => (
          <Tab
            eventKey={editor.id}
            title={`Graph ${index + 1}`}
            key={editor.id}
          >
            <div
              ref={editorRefs.current[editor.id]}
              style={{ height: "1000px", background: "#f3f3f3" }}
            ></div>
          </Tab>
        ))}
      </Tabs>
    );
  };

  const handleHide = () => {
    setContextMenuState((prevState) => ({
      ...prevState,
      visible: false,
    }));
  };

  return (
    <div className="container-fluid h-100">
      <div className="row">
        <div className="col-12 pb-1">
          <Button onClick={addTab} className="me-1">
            Add New graph
          </Button>
          <button onClick={handleCreateLinks} className="btn btn-primary me-1">
            Create Links Based on Shared Properties
          </button>
          <button
            onClick={() => setShowOntologyModal(true)}
            className="btn btn-primary me-1"
          >
            Open Ontology Modal
          </button>
          <button
            onClick={removeSelectedElementFromActiveGraph}
            className="btn btn-danger me-1"
          >
            Remove Selected Element
          </button>
          <button
            onClick={() => addElementToActiveGraph("Entity")}
            className="btn btn-secondary me-1"
          >
            Add Entity
          </button>
          <button
            onClick={() => addElementToActiveGraph("Relationship")}
            className="btn btn-secondary me-1"
          >
            Add Relationship
          </button>
          <button
            onClick={() => addElementToActiveGraph("CustomShape")}
            className="btn btn-secondary me-1"
          >
            Add Custom Shape
          </button>
          <button onClick={exportActiveGraph} className="btn btn-success me-1">
            Export ERD
          </button>
          <input
            type="file"
            accept=".json"
            onChange={(e) => handleFileChosen(e.target.files[0])}
            className="me-1"
          />
        </div>
      </div>

      <div className="row h-100">
        <ContextMenu
          visible={contextMenuState.visible}
          position={contextMenuState.position}
          onHide={handleHide}
          onSelect={handleSelect}
        />
        <CanvasContextMenu
  visible={canvasMenuState.visible}
  position={canvasMenuState.position}
  onSelect={handleCanvasMenuSelect}
  onHide={() => setCanvasMenuState({ ...canvasMenuState, visible: false })}
/>
        <div
          className="col-md-2 p-2"
          style={{ overflowY: "auto", background: "#eaeaea" }}
        >
          <TreeView
            elements={elementsByTab[activeTab] || []}
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
            initialName={elementName}
            initialDescription={elementDescription}
            initialProperties={customProperties}
            position={modalPosition}
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
