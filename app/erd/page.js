'use client'
import React, { useState } from 'react';
import { Tab, Nav, Dropdown, ButtonGroup } from 'react-bootstrap';
import ErdEditor from './ErdEditor';
import SparqlEditor from './SparqlEditor';
// Import or define other components like SparqlQuery and OtherComponent

export default function Home() {
  const [tabs, setTabs] = useState([]);
  const [activeKey, setActiveKey] = useState(null);
  const [tabCounter, setTabCounter] = useState(0);

  // Function to generate a unique key for each new tab
  const generateUniqueKey = (prefix) => `${prefix}-${tabCounter}`;

  // Function to handle adding new tabs
  const addTab = (type) => {
    const newTabKey = generateUniqueKey(type);
    let component;

    switch(type) {
      case 'erdEditor':
        component = <ErdEditor />;
        break;
      case 'sparqlQuery':
        component = <div><SparqlEditor/></div>;
        break;
      case 'other':
        component = <div>Other Component</div>;
        break;
      default:
        component = <div>Default Component</div>;
    }

    const newTab = { eventKey: newTabKey, title: `#${tabCounter + 1} ${type} `, component };
    setTabs([...tabs, newTab]);
    setActiveKey(newTabKey);
    setTabCounter(tabCounter + 1);
  };

  return (
    <Tab.Container id="tab-top-example" activeKey={activeKey} onSelect={setActiveKey}>
      <Nav variant="pills" className="flex-row pb-2 ps-2 custom-dropdown-nav ">
        {tabs.map(tab => (
          <Nav.Item key={tab.eventKey}>
            <Nav.Link eventKey={tab.eventKey}>{tab.title}</Nav.Link>
          </Nav.Item>
        ))}
        <Dropdown as={ButtonGroup}>
          <Dropdown.Toggle split id="dropdown-custom-2">Add Tab</Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => addTab('erdEditor')}>ERD Editor</Dropdown.Item>
            <Dropdown.Item onClick={() => addTab('sparqlQuery')}>SPARQL Query</Dropdown.Item>
            <Dropdown.Item onClick={() => addTab('other')}>Other</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Nav>
      <Tab.Content>
        {tabs.map(tab => (
          <Tab.Pane eventKey={tab.eventKey} key={tab.eventKey}>
            {tab.component}
          </Tab.Pane>
        ))}
      </Tab.Content>
    </Tab.Container>
  );
}
