import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

// import Form from 'react-bootstrap/Form';
import Button from "react-bootstrap/Button";
// import Alert from 'react-bootstrap/Alert';

const { ipcRenderer } = window.require("electron");
// const lodash = require('lodash');

function WarningDelete(props) {
  function handleDelete() {
    ipcRenderer.send("confirm-delete");
  }

  function handleCancel() {
    ipcRenderer.send("cancel-delete");
  }

  return (
    <>
      <h1>Delete the element</h1>
      <h3>Are you sure you want to delete this element?</h3>
      <Button variant="secondary" size="sm" onClick={handleCancel}>
        cancel
      </Button>
      <Button variant="danger" size="sm" onClick={handleDelete}>
        delete
      </Button>
    </>
  );
}

export default WarningDelete;
