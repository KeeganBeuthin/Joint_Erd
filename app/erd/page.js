// erd/page.js
'use client'
import React, { useState,useEffect } from 'react';
import { Tab, Nav, Dropdown, ButtonGroup } from 'react-bootstrap';
import ErdEditor from './ErdEditor';
import SparqlEditor from './SparqlEditor';
import userManager from '@/utils/oidc';

// Import or define other components like SparqlQuery and OtherComponent

export default function Home() {
  const [tabs, setTabs] = useState([]);
  const [activeKey, setActiveKey] = useState(null);
  const [tabCounter, setTabCounter] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const user = await userManager.getUser();
        if (!user || user.expired) {
          await userManager.signinRedirect(); // Redirect user to login if not authenticated or session expired
        } else {
          setUser(user); // Set user if authenticated
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        userManager.signinRedirect(); // Attempt to redirect to login if there is an error fetching the user
      }
    }

    fetchUser();
  }, []);

  // Function to generate a unique key for each new tab
  const generateUniqueKey = (prefix) => `${prefix}-${tabCounter}`;

  // Function to handle adding new tabs
  const addTab = (type) => {
    const newTabKey = generateUniqueKey(type);
    let component;

    switch(type) {
      case 'erdEditor':
        component = user ? <ErdEditor /> : <div>Login Required</div>;
        break;
      case 'sparqlQuery':
        component = user ? <div><SparqlEditor/></div> : <div>Login Required</div>;
        break;
      case 'other':
        component = user ? <div>Other Component</div> : <div>Login Required</div>;
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
          // Render the Tab.Pane based on tab.eventKey
          <Tab.Pane eventKey={tab.eventKey} key={tab.eventKey}>
            {tab.eventKey.includes('erdEditor') && (user ? <ErdEditor /> : <div>Login Required</div>)}
            {tab.eventKey.includes('sparqlQuery') && (user ? <SparqlEditor/> : <div>Login Required</div>)}
            {tab.eventKey.includes('other') && (user ? <div>Other Component</div> : <div>Login Required</div>)}
            {/* You can add similar conditional renderings for other components that require authentication */}
          </Tab.Pane>
        ))}
      </Tab.Content>
    </Tab.Container>
  );
}
