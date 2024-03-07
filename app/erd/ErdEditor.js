// erd/ErdEditor.js
import React, { useEffect, useRef, useState } from "react";
import JointJSEditor from "./JointJSEditor";
import { exportGraph } from "./JointJSEditor";
import CreateOntology from "./OntologyModal";
import InfoModal from "./InfoModal";
const ErdEditor = () => {
  const containerRef = useRef(null);
  const [editor, setEditor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentElement, setCurrentElement] = useState(null);

  useEffect(() => {
    if (containerRef.current && !editor) {
      const editorInstance = JointJSEditor(
        containerRef.current,
        handleElementDoubleClick
      );
      setEditor(editorInstance);
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
    <div>
      <button onClick={() => setShowModal(true)}>Open Ontology Modal</button>
      <button onClick={() => editor?.addElement("Entity")}>Add Entity</button>
      <button onClick={() => editor?.addElement("Relationship")}>
        Add Relationship
      </button>
      <button onClick={() => editor?.addElement("CustomShape")}>
        Add Custom Shape
      </button>
      <button onClick={() => exportGraph(editor.graph)}>Export ERD</button>
      <input
        type="file"
        accept=".json"
        onChange={(e) => handleFileChosen(e.target.files[0])}
      />
      <div
        ref={containerRef}
        style={{ width: "100%", height: "600px", background: "#f3f3f3" }}
      ></div>

      <InfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialName={currentElement?.attr("text/text") || ""}
        initialDescription={currentElement?.prop("description") || ""}
      />

      <CreateOntology show={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default ErdEditor;
