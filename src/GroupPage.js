import React from "react";
// import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "react-bootstrap/Navbar";
// import Nav from 'react-bootstrap/Nav';
// import NavDropdown from 'react-bootstrap/NavDropdown';
import Container from "react-bootstrap/Container";

import IzejvielasBlock from "./RawMaterial/IzejvielasBlock";
import FixedCostBlock from "./FixedCost/FixedCostBlock";
import PackageBlock from "./Package/PackageBlock";
import WorkersBlock from "./Workers/WorkersBlock";
import ElectricityBlock from "./Electricity/ElectricityBlock";

// import globalSettings from './globalSettings';

import { useParams, useHistory } from "react-router-dom";

// const { ipcRenderer } = window.require("electron");
// const lodash = require('lodash');

function GroupPage() {
  // We can use the `useParams` hook here to access
  // the dynamic pieces of the URL.
  let { groupName } = useParams();

  return (
    <>
      <NavigationBar groupName={groupName} />
      <h2>{"Grupa: " + groupName}</h2>
      <ElectricityBlock nosaukums={groupName} type={"grupas"} />
      <IzejvielasBlock nosaukums={groupName} type={"grupas"} />
      <FixedCostBlock nosaukums={groupName} type={"grupas"} />
      <PackageBlock nosaukums={groupName} type={"grupas"} />
      <WorkersBlock nosaukums={groupName} type={"grupas"} />
    </>
  );
}

function NavigationBar(props) {
  let history = useHistory();

  function handleClick(path, e) {
    history.push(path);
  }

  return (
    <>
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand onClick={(e) => handleClick("/")}>
            На главную
          </Navbar.Brand>
        </Container>
      </Navbar>
    </>
  );
}

export default GroupPage;
