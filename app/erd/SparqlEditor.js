// components/SparqlEditor.js
import { useState } from 'react';

const SparqlEditor = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [resultsFormat, setResultsFormat] = useState('HTML');
  const [timeout, setTimeout] = useState(30000);
  const [options, setOptions] = useState({
    strictChecking: true,
    suppressErrors: false,
    logDebugInfo: false,
    generateReport: false,
  });

  const handleQueryChange = (e) => setQuery(e.target.value);
  const handleFormatChange = (e) => setResultsFormat(e.target.value);
  const handleTimeoutChange = (e) => setTimeout(e.target.value);

  const handleOptionChange = (e) => {
    setOptions((prevOptions) => ({
      ...prevOptions,
      [e.target.name]: e.target.checked,
    }));
  };

  const executeQuery = async () => {
    const response = await fetch('/api/execute-query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        resultsFormat,
        timeout,
        options,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      setResults(data);
    } else {
      // Handle errors or unsuccessful responses
      console.error('Failed to execute query');
    }
  };

  const resetEditor = () => {
    setQuery('');
    setResults(null);
    setResultsFormat('HTML');
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
      <div className="mb-3">
        <label htmlFor="query-text" className="form-label">Query Text</label>
        <textarea
          className="form-control"
          id="query-text"
          rows="10"
          value={query}
          onChange={handleQueryChange}
        ></textarea>
      </div>

      <div className="mb-3">
        <label htmlFor="results-format" className="form-label">Results Format</label>
        <select
          className="form-select"
          id="results-format"
          value={resultsFormat}
          onChange={handleFormatChange}
        >
          <option>HTML</option>
          <option>XML</option>
          <option>JSON</option>
          <option>CSV</option>
        </select>
      </div>

      <div className="mb-3">
        <label htmlFor="timeout" className="form-label">Execution timeout (milliseconds)</label>
        <input
          type="number"
          className="form-control"
          id="timeout"
          value={timeout}
          onChange={handleTimeoutChange}
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
            onChange={handleOptionChange}
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
            onChange={handleOptionChange}
          />
          <label className="form-check-label" htmlFor="suppressErrors">
            Suppress errors on wrong geometries and errors on geometrical operators
          </label>
        </div>
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="logDebugInfo"
            name="logDebugInfo"
            checked={options.logDebugInfo}
            onChange={handleOptionChange}
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
            onChange={handleOptionChange}
          />
          <label className="form-check-label" htmlFor="generateReport">
            Generate SPARQL compilation report
          </label>
        </div>
      </div>

      <button className="btn btn-primary" onClick={executeQuery}>Execute Query</button>
      <button className="btn btn-secondary ms-2" onClick={resetEditor}>Reset</button>

      <div className="results mt-3">
        <pre>{JSON.stringify(results, null, 2)}</pre>
      </div>
    </div>
  );
};

export default SparqlEditor;
