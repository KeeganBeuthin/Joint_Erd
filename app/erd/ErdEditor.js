// erd/ErdEditor.js
import React, { useEffect, useRef, useState } from "react";
import JointJSEditor from "./JointJSEditor";
import { exportGraph } from "./JointJSEditor";
import OntologyModal from "./OntologyModal";
import InfoModal from "./InfoModal";
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
  const [editors, setEditors] = useState([
    { id: "editor-0", instance: null, elements: [] },
  ]);
  const [activeTab, setActiveTab] = useState("editor-0");
  const [elementsByTab, setElementsByTab] = useState({ "editor-0": [] });
  const [elementName, setElementName] = useState("default");
  const [elementDescription, setElementDescription] = useState("default");

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
          handleElementClick
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
        handleElementClick
      );
      setEditors((prevEditors) =>
        prevEditors.map((editor) =>
          editor.id === tabId ? { ...editor, instance: editorInstance } : editor
        )
      );
      updateElementsList(editorInstance, tabId);
    }
  }, [activeTab, editors]);

  const initializeEditorForTab = (tabId) => {
    if (!editorRefs.current[tabId]) {
      editorRefs.current[tabId] = React.createRef();
    }
    const container = editorRefs.current[tabId].current;
    const editorForTab = editors.find((editor) => editor.id === tabId);
    if (container && (!editorForTab || !editorForTab.instance)) {
      const editorInstance = JointJSEditor(
        container,
        handleElementDoubleClick,
        handleElementClick
      );
      setEditors((prevEditors) =>
        prevEditors.map((editor) =>
          editor.id === tabId ? { ...editor, instance: editorInstance } : editor
        )
      );
      updateElementsList(editorInstance, tabId);
    }
  };

  const addTab = () => {
    const newTabId = `editor-${editors.length}`;
    setEditors([...editors, { id: newTabId, instance: null, elements: [] }]);
    setActiveTab(newTabId);
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

    setCurrentElementId(element.id);
    setCustomProperties(element.prop("customProperties") || []);
    setElementName(element.attr("text/text") || "");
    setElementDescription(element.prop("description") || "");

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
              style={{ height: "600px", background: "#f3f3f3" }}
            ></div>
          </Tab>
        ))}
      </Tabs>
    );
  };

  return (
    <div className="container-fluid h-100">
      <div className="row">
        <div className="col-12">
          <Button onClick={addTab} className="m-1">
            Add New Tab
          </Button>
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
            onClick={removeSelectedElementFromActiveGraph}
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
          <button onClick={exportActiveGraph} className="btn btn-success m-1">
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
