// erd/SparqlEditor.js
import { useState } from "react";
import { Tabs, Tab } from "react-bootstrap";

const SparqlEditor = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [resultsFormat, setResultsFormat] = useState("HTML");
  const [activeTab, setActiveTab] = useState("editor");
  const [timeout, setTimeout] = useState(30000);
  const [originalData, setOriginalData] = useState(null);
  const [options, setOptions] = useState({
    strictChecking: true,
    suppressErrors: false,
    logDebugInfo: false,
    generateReport: false,
  });

  const handleQueryChange = (e) => setQuery(e.target.value);
  const handleFormatChange = (e) => {
    setResultsFormat(e.target.value);
    convertResults(e.target.value);
  };
  const handleTimeoutChange = (e) => setTimeout(e.target.value);

  const handleOptionChange = (e) => {
    setOptions((prevOptions) => ({
      ...prevOptions,
      [e.target.name]: e.target.checked,
    }));
  };

  const executeQuery = async () => {
    const endpointUrl = "https://dbpedia.org/sparql";
    const queryUrl = `${endpointUrl}?query=${encodeURIComponent(
      query
    )}&format=json`;

    try {
      const response = await fetch(queryUrl, {
        method: "GET",
        headers: {
          Accept: "application/sparql-results+json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOriginalData(data);
        setResults(JSON.stringify(data, null, 2));
      } else {
        console.error("Failed to execute query:", response.statusText);
        setResults({
          error: `Failed to fetch results: ${response.statusText}`,
        });
      }
    } catch (error) {
      console.error("Error while fetching results:", error.message);
      setResults({ error: `Error while fetching results: ${error.message}` });
    }
  };

  const convertJsonToHtml = (json) => {
    if (typeof json === "string") {
      try {
        json = JSON.parse(json);
      } catch (e) {
        return "<p>Error parsing JSON</p>";
      }
    }
    let html = "<div>";
    if (json && json.results && json.results.bindings) {
      json.results.bindings.forEach((binding) => {
        html += "<div>";
        Object.keys(binding).forEach((key) => {
          html += `<strong>${key}:</strong> ${binding[key].value}<br/>`;
        });
        html += "</div><hr/>";
      });
    }
    html += "</div>";
    return html;
  };

  const convertJsonToXml = (json) => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<results>';

    const convertItemToXml = (item) => {
      let itemXml = "";
      Object.keys(item).forEach((key) => {
        const value = item[key].value || item[key];
        itemXml += `<${key}>${value}</${key}>`;
      });
      return itemXml;
    };

    if (typeof json === "string") {
      try {
        json = JSON.parse(json);
      } catch (error) {
        console.error("Error parsing JSON for XML conversion:", error);
        return "Error parsing JSON";
      }
    }

    if (json.results && json.results.bindings) {
      json.results.bindings.forEach((binding) => {
        xml += `<result>${convertItemToXml(binding)}</result>`;
      });
    }

    xml += "</results>";
    return xml;
  };

  const convertJsonToCsv = (json) => {
    let data;

    // Check if json is a string and needs parsing
    if (typeof json === "string") {
      try {
        data = JSON.parse(json);
      } catch (error) {
        console.error("Error parsing JSON:", error);
        return "Error parsing JSON";
      }
    } else {
      data = json;
    }

    const items =
      data.results && data.results.bindings ? data.results.bindings : [];
    if (!items.length) {
      return "No data available";
    }

    const headers = Object.keys(items[0]);
    const csvRows = [headers.join(",")];

    items.forEach((item) => {
      const row = headers.map((header) => {
        const value = item[header] ? item[header].value : "";
        const formattedValue = value.replace(/"/g, '""');
        return `"${formattedValue}"`;
      });
      csvRows.push(row.join(","));
    });

    return csvRows.join("\n");
  };

  const convertResults = (format) => {
    if (!originalData) return;

    try {
      let convertedResults = "";
      switch (format) {
        case "HTML":
          convertedResults = convertJsonToHtml(originalData);
          break;
        case "XML":
          convertedResults = convertJsonToXml(originalData);
          break;
        case "CSV":
          convertedResults = convertJsonToCsv(originalData);
          break;
        default:
          convertedResults = JSON.stringify(originalData, null, 2);
      }
      setResults(convertedResults);
    } catch (error) {
      console.error("Error converting results:", error);
      setResults("Error converting results.");
    }
  };

  const resetEditor = () => {
    setQuery("");
    setResults(null);
    setResultsFormat("HTML");
    setTimeout(30000);
    setOptions({
      strictChecking: true,
      suppressErrors: false,
      logDebugInfo: false,
      generateReport: false,
    });
  };

  return (
    <div className="container my-5">
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
      >
        <Tab eventKey="editor" title="SPARQL Editor">
          <div className="mb-3">
            <label htmlFor="query-text" className="form-label">
              Query Text
            </label>
            <textarea
              className="form-control"
              id="query-text"
              rows="10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            ></textarea>
          </div>

          <div className="mb-3">
            <label htmlFor="results-format" className="form-label">
              Results Format
            </label>
            <select
              className="form-select"
              id="results-format"
              value={resultsFormat}
              onChange={(e) => setResultsFormat(e.target.value)}
            >
              <option>HTML</option>
              <option>XML</option>
              <option>JSON</option>
              <option>CSV</option>
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="timeout" className="form-label">
              Execution timeout (milliseconds)
            </label>
            <input
              type="number"
              className="form-control"
              id="timeout"
              value={timeout}
              onChange={(e) => setTimeout(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="strictChecking"
                name="strictChecking"
                checked={options.strictChecking}
                onChange={(e) => handleOptionChange(e)}
              />
              <label className="form-check-label" htmlFor="strictChecking">
                Strict checking of void variables
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="suppressErrors"
                name="suppressErrors"
                checked={options.suppressErrors}
                onChange={(e) => handleOptionChange(e)}
              />
              <label className="form-check-label" htmlFor="suppressErrors">
                Suppress errors on wrong geometries and errors on geometrical
                operators
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="logDebugInfo"
                name="logDebugInfo"
                checked={options.logDebugInfo}
                onChange={(e) => handleOptionChange(e)}
              />
              <label className="form-check-label" htmlFor="logDebugInfo">
                Log debug info at the end of output
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="generateReport"
                name="generateReport"
                checked={options.generateReport}
                onChange={(e) => handleOptionChange(e)}
              />
              <label className="form-check-label" htmlFor="generateReport">
                Generate SPARQL compilation report
              </label>
            </div>
          </div>

          <button className="btn btn-primary" onClick={executeQuery}>
            Execute Query
          </button>
          <button className="btn btn-secondary ms-2" onClick={resetEditor}>
            Reset
          </button>
        </Tab>
        <Tab eventKey="results" title="Results">
          <div className="mb-3">
            <button
              className="btn btn-secondary me-2"
              onClick={() => convertResults("JSON")}
            >
              JSON
            </button>
            <button
              className="btn btn-secondary me-2"
              onClick={() => convertResults("HTML")}
            >
              HTML
            </button>
            <button
              className="btn btn-secondary me-2"
              onClick={() => convertResults("XML")}
            >
              XML
            </button>
            <button
              className="btn btn-secondary me-2"
              onClick={() => convertResults("CSV")}
            >
              CSV
            </button>
          </div>
          <div className="results mt-3">
            {resultsFormat === "HTML" ? (
              <div dangerouslySetInnerHTML={{ __html: results }} />
            ) : (
              <pre>{results}</pre>
            )}
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

export default SparqlEditor;
