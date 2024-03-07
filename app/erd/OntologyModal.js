// erd/OntologyModal.js

import { useState } from 'react';
import { DataFactory, NamedNode, Literal, Store, Writer, toRDF } from 'n3';
import { Modal } from 'react-bootstrap';


export default function CreateOntology({ show, onClose }) {
  const [ontologyName, setOntologyName] = useState('');
  const [properties, setProperties] = useState([]);

  const handleAddProperty = () => {
    setProperties([...properties, '']);
  };

  const handleChangePropertyName = (index, value) => {
    const updatedProperties = [...properties];
    updatedProperties[index] = value;
    setProperties(updatedProperties);
  };

  const handleCreateOntology = () => {
    // Construct RDF triples based on the properties
    const rdfTriples = properties.map((property, index) => ({
      subject: `ex:Subject${index + 1}`,
      predicate: 'ex:hasProperty',
      object: `"${property}"`,
    }));

    // Create a new RDF store
    const store = new Store();

    // Add RDF triples to the store
    rdfTriples.forEach(triple => {
      const statement = DataFactory.quad(
        DataFactory.namedNode(`http://example.org/${triple.subject}`),
        DataFactory.namedNode(`http://example.org/${triple.predicate}`),
        DataFactory.literal(triple.object.replace(/\"/g, ''))
      );
      store.addQuad(statement);
    });

    // Serialize RDF store into RDF/XML format
    const writer = new Writer();
    writer.addQuads([...store]);
    let rdfData = `<?xml version="1.0" encoding="UTF-8"?>
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
             xmlns:ex="http://example.org/">\n`;
    
    // Add RDF triples to the RDF/XML data
    store.getQuads().forEach(quad => {
      const subject = quad.subject.value.replace('http://example.org/', 'ex:');
      const predicate = quad.predicate.value.replace('http://example.org/', 'ex:');
      const object = quad.object.termType === 'Literal' ? `"${quad.object.value}"` : quad.object.value.replace('http://example.org/', 'ex:');
      rdfData += `  <rdf:Description rdf:about="${subject}">
        <${predicate}>${object}</${predicate}>
      </rdf:Description>\n`;
    });
    
    rdfData += `</rdf:RDF>`;
    
    // Create a Blob containing the RDF data
    const blob = new Blob([rdfData], { type: 'application/rdf+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    // Create a temporary link and click it to trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${ontologyName}.rdf`);
    document.body.appendChild(link);
    link.click();

    // Clean up by revoking the URL
    URL.revokeObjectURL(url);
    document.body.removeChild(link);
  };

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Ontology Editor</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="container">
          <div className="form-group">
            <label>Ontology Name:</label>
            <input
              type="text"
              className="form-control"
              value={ontologyName}
              onChange={(e) => setOntologyName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <button className="btn btn-primary mr-2" onClick={handleAddProperty}>Add Property</button>
          </div>
          {properties.map((property, index) => (
            <div className="form-group" key={index}>
              <label>Property {index + 1}:</label>
              <input
                type="text"
                className="form-control"
                value={property}
                onChange={(e) => handleChangePropertyName(index, e.target.value)}
              />
            </div>
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-secondary" onClick={onClose}>Close</button>
        <button className="btn btn-success" onClick={handleCreateOntology}>Create Ontology Data</button>
      </Modal.Footer>
    </Modal>
  );
}