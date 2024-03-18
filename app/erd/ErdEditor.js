// erd/ErdEditor.js
import React, { useEffect, useRef, useState } from "react";
import JointJSEditor from "./JointJSEditor";
import { exportGraph } from "./JointJSEditor";
import OntologyModal from "./OntologyModal";
import InfoModal from "./InfoModal";
import { Container, Row, Col, Button, Modal, Form } from "react-bootstrap";
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

  useEffect(() => {
    if (workspaceRef.current && !editor) {
      const editorInstance = JointJSEditor(
        workspaceRef.current,
        handleElementDoubleClick,
        handleElementClick
      );
      setEditor(editorInstance);
      editorInstance.graph.on("add remove change:attrs", () =>
        updateElementsList(editorInstance)
      );
      updateElementsList(editorInstance);
    }
  }, [editor]);

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
  };

  const handleModalSubmit = ({ name, description, properties }) => {
    if (currentElementId && editor) {
      const element = editor.graph.getCell(currentElementId);
      if (element) {
        element.attr("text/text", name);
        element.prop("description", description);
        element.prop("customProperties", properties);
      }
    }
    setIsModalOpen(false);
  };

  const handleElementClick = (elementId) => {
    setSelectedElementId(elementId);
  };
  const handleCreateLinks = () => {
    if (editor) {
      editor.createLinksForSharedProperties();
    }
  };

  const handleFileRead = async (e) => {
    const content = e.target.result;
    const graphJson = JSON.parse(content);

    if (editor && editor.graph) {
      try {
        editor.graph.fromJSON(graphJson);
        console.log("Graph imported successfully.");
        const importedElements = editor.graph.getElements().map((el) => ({
          id: el.id,
          name:
            el.attr("text/text") ||
            `Unnamed ${el.get("type")} ${el.id.substring(0, 8)}`,
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

  return (
    <div className="container-fluid h-100">
      <div className="row">
        <div className="col-12">
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
            onClick={() => editor?.addElement("Entity")}
            className="btn btn-secondary m-1"
          >
            Add Entity
          </button>
          <button
            onClick={() => editor?.addElement("Relationship")}
            className="btn btn-secondary m-1"
          >
            Add Relationship
          </button>
          <button
            onClick={() => editor?.addElement("CustomShape")}
            className="btn btn-secondary m-1"
          >
            Add Custom Shape
          </button>
          <button
            onClick={() => exportGraph(editor.graph)}
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
