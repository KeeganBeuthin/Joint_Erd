import React, { useEffect, useRef } from 'react';
import Yasgui from "@triply/yasgui";
import "@triply/yasgui/build/yasgui.min.css";

const SparqlEditor = () => {
    const yasguiRef = useRef(null);

    useEffect(() => {
        if (yasguiRef.current) {
            const yasgui = new Yasgui(yasguiRef.current, {
                requestConfig: {
                    endpoint: "https://dbpedia.org/sparql",
                    method: "GET", 
                },
                copyEndpointOnNewTab: false
            });

            yasgui.on("queryResponse", (instance, tab) => {
                console.log("Query response received", tab);
            });

            return () => {
                yasguiRef.current.innerHTML = ''; 
            };
        }
    }, []);

return (
    <div className="sparql-editor-container" style={{ height: '100%' }}>
      <div className="editor-header">
      </div>
      <div className="editor-content" style={{ flex: 1 }}>
        <div ref={yasguiRef} className="query-input" style={{ height: '100%' }} />
        <div className="results-output">
        </div>
      </div>
    </div>
  );
};
export default SparqlEditor;
