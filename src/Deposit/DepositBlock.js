import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Form from "react-bootstrap/Form";

import "../App.css";

import globalSettings from "../globalSettings";

import GeneralizedTable from "../GeneralizedTable";

const { ipcRenderer } = window.require("electron");
const lodash = require("lodash");

function DepositBlock(props) {
  let headerNames = ["", "Value"];

  return (
    <>
      <h3 className="text-center">Deposit</h3>
      <GeneralizedTable
        headerNames={headerNames}
        tableBody={<DepositTableBody {...props} />}
      />
    </>
  );
}

function DepositTableBody(props) {
  // Get electricity data from main process
  let data = JSON.parse(ipcRenderer.sendSync("get-data"));

  let productObj = lodash
    .chain(data)
    .get(props.type)
    .find({ nosaukums: props.nosaukums })
    .value();

  let obj = productObj["deposit"];

  return (
    <>
      <tbody>
        <tr className="align-middle">
          <td className="col-md-3 text-end">Value:</td>
          <td>{obj.toFixed(globalSettings["floatPrecisionSecondary"])}</td>
        </tr>
      </tbody>
    </>
  );
}

export default DepositBlock;
