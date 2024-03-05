// erd/ErdEditor.js
import React, { useEffect, useRef, useState } from 'react';
import JointJSEditor from './JointJSEditor';
import { exportGraph } from './JointJSEditor';

const ErdEditor = () => {
    const containerRef = useRef(null);
    const [editor, setEditor] = useState(null);

    useEffect(() => {
      if (containerRef.current && !editor) {
        const editorInstance = JointJSEditor(containerRef.current);
        setEditor(editorInstance);
      }
    }, [editor]);

    const handleFileRead = async (e) => {
        const content = e.target.result;
        const graphJson = JSON.parse(content);

        if (editor && editor.graph) {
          try {
            editor.graph.fromJSON(graphJson); // This should work as expected now
            console.log('Graph imported successfully.');
          } catch (error) {
            console.error('Error importing graph:', error);
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
        <button onClick={() => editor?.addElement('Entity')}>Add Entity</button>
        <button onClick={() => editor?.addElement('Relationship')}>Add Relationship</button>
        <button onClick={() => exportGraph(editor.graph)}>Export ERD</button>
        <input type='file' accept='.json' onChange={e => handleFileChosen(e.target.files[0])} />
        <div ref={containerRef} style={{ width: '100%', height: '600px', background: '#f3f3f3' }}></div>
      </div>
    );
};

export default ErdEditor;
