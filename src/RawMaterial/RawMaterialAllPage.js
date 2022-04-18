import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

import Button from "react-bootstrap/Button";

import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import BootstrapTable from "react-bootstrap-table-next";
import cellEditFactory from "react-bootstrap-table2-editor";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";

import AddNewItemButton from "../AddNewItemButton";
import NavBar from "../NavBar/NavBar";
import globalSettings from "../globalSettings";
import "../App.css";

const { ipcRenderer } = window.require("electron");
const lodash = require("lodash");

function RawMaterialAllPage() {
  return (
    <>
      <NavBar />
      <h3 className="text-center">Raw materials</h3>
      <AddNewItemButton message={"raw-material:ask-for-window"} />
      <NewTable />
    </>
  );
}

function buttonFormatter(cell, row, rowIndex) {
  return <DeleteRawButton nosaukums={row.nosaukums} />;
}

const cellEdit = cellEditFactory({
  mode: "dbclick",
  blurToSave: true,
  afterSaveCell: cenaUpdate,
});

function NewTable(props) {
  // Get raw material data from main process
  let data = JSON.parse(ipcRenderer.sendSync("get-data"));
  data = lodash.chain(data).get("izejvielas").value();

  const { SearchBar } = Search;

  const columns = [
    {
      dataField: "kods",
      text: "Code",
      editable: false,
      sort: true,
      headerAlign: "center",
      headerStyle: { width: "80px" },
    },
    {
      dataField: "nosaukums",
      text: "Name",
      sort: true,
      headerAlign: "center",
      editable: false,
    },
    {
      dataField: "mervieniba",
      text: "Measure",
      headerAlign: "center",
      headerStyle: { width: "12%" },
      editable: false,
    },
    {
      dataField: "cena",
      text: "Price",
      sort: true,
      headerAlign: "center",
      headerStyle: { width: "200px" },
      validator: (newValue, row, column) => {
        if (isNaN(newValue)) {
          return {
            valid: false,
            message: "Введите число",
          };
        }
        return true;
      },
    },
    {
      dataField: "",
      text: "Remove",
      headerAlign: "center",
      headerStyle: { width: "80px" },
      editable: false,
      formatter: buttonFormatter,
    },
  ];

  return (
    <ToolkitProvider keyField="nosaukums" data={data} columns={columns} search>
      {(props) => (
        <div>
          <h5>Search:</h5>
          <SearchBar
            {...props.searchProps}
            className="custom-search-field"
            placeholder="e.g. sugar"
            srText=""
          />
          <hr />
          <BootstrapTable
            {...props.baseProps}
            bootstrap4
            striped
            hover
            condensed
            cellEdit={cellEdit}
          />
        </div>
      )}
    </ToolkitProvider>
  );
}

function cenaUpdate(oldValue, newValue, row, column) {
  let newCena = newValue;

  let data = JSON.parse(ipcRenderer.sendSync("get-data"));
  lodash
    .chain(data)
    .get("izejvielas")
    .find({ nosaukums: row.nosaukums })
    .assign({ cena: parseFloat(newCena) })
    .value();

  // We need to update the value everythere i.e. in all groups and all products
  // which have this specific expense in the list

  // Get all products
  let productObjects = lodash.chain(data).get("produkti").value();

  // Get all grupas
  let groupObjects = lodash.chain(data).get("grupas").value();

  productObjects.forEach((product) => {
    // Get object
    let izejvielasObj = lodash
      .chain(product)
      .get("izejvielas")
      .find({ nosaukums: row.nosaukums })
      .value();
    // If object exists
    if (izejvielasObj !== undefined) {
      let newKopuma = newCena * izejvielasObj["daudzums"];

      lodash
        .chain(izejvielasObj)
        .assign({ cena: parseFloat(newCena) })
        .assign({ kopuma: parseFloat(newKopuma) })
        .value();
    }
  });

  groupObjects.forEach((group) => {
    let izejvielasObj = lodash
      .chain(group)
      .get("izejvielas")
      .find({ nosaukums: row.nosaukums })
      .value();

    if (izejvielasObj !== undefined) {
      let newKopuma = newCena * izejvielasObj["daudzums"];

      lodash
        .chain(izejvielasObj)
        .assign({ cena: parseFloat(newCena) })
        .assign({ kopuma: parseFloat(newKopuma) })
        .value();
    }
  });

  // Update data
  ipcRenderer.sendSync("modify-data", [JSON.stringify(data), false]);
}

function DeleteRawButton(props) {
  function handleClick() {
    let data = JSON.parse(ipcRenderer.sendSync("get-data"));

    ipcRenderer.send("warning-delete");
    ipcRenderer.on("confirm-delete", (event, arg) => {
      lodash
        .chain(data)
        .get("izejvielas")
        .remove({ nosaukums: props.nosaukums })
        .value();
      ipcRenderer.sendSync("modify-data", [JSON.stringify(data)]);
    });
  }
  return (
    <Button variant="danger" size="sm" onClick={handleClick}>
      remove
    </Button>
  );
}

export default RawMaterialAllPage;
