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
  const [tabs, setTabs] = useState([
    { id: 1, name: 'Tab 1', editorInstance: null, graphJson: null },
  ]);
  const [activeTabId, setActiveTabId] = useState(1);

  const activeTab = tabs.find(tab => tab.id === activeTabId) || {};

  const addNewTab = () => {
    saveCurrentGraphState()
    const newTabId = tabs.length + 1;
    setTabs([...tabs, { id: newTabId, name: `Tab ${newTabId}`, editorInstance: null }]);
    setActiveTabId(newTabId);
  };

  useEffect(() => {
    if (workspaceRef.current && !activeTab.editorInstance) {
      const editorInstance = JointJSEditor(
        workspaceRef.current,
        handleElementDoubleClick,
        handleElementClick,
        activeTabId
      );
     
      setEditor(editorInstance);
      editorInstance.graph.on("add remove change:attrs", () =>
        updateElementsList(editorInstance)
      );
      updateElementsList(editorInstance);
    }
  }, [editor, activeTabId, tabs]);

  useEffect(() => {
    console.log(`Active tab ID changed to: ${activeTabId}`);
    const activeTab = tabs.find(tab => tab.id === activeTabId);
    console.log(`Found active tab: `, activeTab);
  
    if (workspaceRef.current && activeTab?.editorInstance) {
      console.log("Setting paper element for the active tab's editor instance.");
      activeTab.editorInstance.paper.setElement(workspaceRef.current);
  
      if (activeTab.graphJson) {
        console.log("Loading graph JSON into the active tab's editor instance:", activeTab.graphJson);
        activeTab.editorInstance.graph.fromJSON(activeTab.graphJson);
        console.log("Graph JSON loaded successfully.");
      } else {
        console.log("No graph JSON data found for the active tab.");
      }
  
      updateElementsList(activeTab.editorInstance);
      console.log("Updated elements list based on the current graph model.");
    } else {
      console.log("Workspace reference or active tab's editor instance not found.");
    }
  }, [activeTabId, tabs]);

  useEffect(() => {
    if (activeTab.editorInstance) {
      const graph = activeTab.editorInstance.graph;
      const onGraphChange = () => saveCurrentGraphState();
  
      graph.on('add remove change', onGraphChange);
  
      // Clean up the event listener when the component unmounts or the active tab changes
      return () => graph.off('add remove change', onGraphChange);
    }
  }, [activeTab.editorInstance, activeTabId])
  
  const switchTab = (newTabId) => {
    saveCurrentGraphState(); // Save the current graph state before switching
    setActiveTabId(newTabId);
  };

  useEffect(() => {
    // This effect ensures that the appropriate editor instance is initialized and displayed when the tab is switched.
    if (workspaceRef.current && !activeTab.editorInstance) {
      // Initialize editor instance if not already done
      const newEditorInstance = JointJSEditor(workspaceRef.current, handleElementDoubleClick, handleElementClick, activeTabId);
      // Update the tabs state with this new editor instance for the active tab
      const updatedTabs = tabs.map(tab => tab.id === activeTabId ? { ...tab, editorInstance: newEditorInstance } : tab);
      setTabs(updatedTabs);
      // Ensure the paper for the newly activated tab is attached to the workspaceRef
      newEditorInstance.paper.setElement(workspaceRef.current);
    } else if (workspaceRef.current && activeTab.editorInstance) {
      // When switching tabs, if the editor instance already exists, we simply need to ensure its paper is displayed
      activeTab.editorInstance.paper.setElement(workspaceRef.current);
      updateElementsList(activeTab.editorInstance);
    }
    // The dependency array here ensures this effect runs only when the activeTabId changes, or the tabs array is updated
  }, [activeTabId, tabs]);


  const saveCurrentGraphState = () => {
    const currentGraphJson = activeTab.editorInstance?.graph.toJSON();
    setTabs(tabs.map(tab =>
      tab.id === activeTabId ? { ...tab, graphJson: currentGraphJson } : tab
    ));
  };

  const updateElementsList = (editorInstance = activeTab.editorInstance) => {
    if (editorInstance) {
      const updatedElements = editorInstance.graph.getElements().map((el) => ({
        id: el.id,
        name: el.attr("text/text") || `Unnamed ${el.get("type")}`,
      }));
      setElements(updatedElements);
    }
  };

  const handleElementDoubleClick = (cellView) => {
    const element = cellView.model;
    setCurrentElementId(element.id);
    setCustomProperties(element.prop("customProperties") || []);
    setIsModalOpen(true);
  };

  const handleModalSubmit = ({ name, description, properties }) => {
    if (currentElementId && activeTab.editorInstance) {
      const element = activeTab.editorInstance.graph.getCell(currentElementId);
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
    if (activeTab.editorInstance) {
      activeTab.editorInstance.createLinksForSharedProperties();
    }
  };

  const handleFileRead = async (e) => {
    const content = e.target.result;
    const graphJson = JSON.parse(content);

    if (activeTab.editorInstance && activeTab.editorInstance.graph) {
      try {
        activeTab.editorInstance.graph.fromJSON(graphJson);
        console.log("Graph imported successfully.");
        const importedElements = activeTab.editorInstance.graph.getElements().map((el) => ({
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

    const element = activeTab.editorInstance.graph.getCell(elementId);
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
    if (!activeTab.editorInstance) {
      return <ElementDetails element={null} />;
    }
    const element = selectedElementId
      ? activeTab.editorInstance.graph.getCell(selectedElementId.split("?")[0])
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
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTabId(tab.id)} className={activeTabId === tab.id ? 'btn btn-primary' : 'btn btn-secondary'}>
              {tab.name}
            </button>
          ))}
          <button onClick={addNewTab} className="btn btn-success">+ New Tab</button>
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
onClick={() => activeTab.editorInstance?.removeElement(selectedElementId)}
className="btn btn-danger m-1"
>
Remove Selected Element
</button>
<button
onClick={() => activeTab.editorInstance?.addElement("Entity")}
className="btn btn-secondary m-1"
>
Add Entity
</button>
<button
onClick={() => activeTab.editorInstance?.addElement("Relationship")}
className="btn btn-secondary m-1"
>
Add Relationship
</button>
<button
onClick={() => activeTab.editorInstance?.addElement("CustomShape")}
className="btn btn-secondary m-1"
>
Add Custom Shape
</button>
<button
onClick={() => exportGraph(activeTab.editorInstance.graph)}
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
        <div className="col-md-2 p-2" style={{ overflowY: "auto", background: "#eaeaea" }}>
          <TreeView elements={elements} onElementSelect={handleElementSelect} selectedElementId={selectedElementId} />
        </div>
        <div className="col-md-7 p-2" style={{ overflowY: "auto" }}>
          <div ref={workspaceRef} style={{ height: "600px", background: "#f3f3f3" }}></div>
        </div>
        <div className="col-md-3 p-2" style={{ overflowY: "auto", background: "#eaeaea" }}>
          {renderSelectedElementDetails()}
        </div>
        {isModalOpen && (
          <InfoModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleModalSubmit}
            initialName={currentElementId ? "Element Name" : ""}
            initialDescription={currentElementId ? "Element Description" : ""}
            initialProperties={customProperties}
          />
        )}
        {showOntologyModal && (
          <OntologyModal show={showOntologyModal} onClose={() => setShowOntologyModal(false)} />
        )}
      </div>
    </div>
  );
};
export default ErdEditor;



