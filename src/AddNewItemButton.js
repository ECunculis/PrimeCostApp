import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";
import "./App.css";

const { ipcRenderer } = window.require("electron");

function AddNewItemButton(props) {
  function handleCLick() {
    ipcRenderer.send(props.message);
  }

  return (
    <div className="addEntryButtons">
      <Button
        variant="secondary"
        size="sm"
        id="addEntryButtons"
        onClick={handleCLick}
      >
        Add
      </Button>
    </div>
  );
}

export default AddNewItemButton;
