import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Form from "react-bootstrap/Form";

import "../App.css";

import globalSettings from "../globalSettings";

import GeneralizedTable from "../GeneralizedTable";

const { ipcRenderer } = window.require("electron");
const lodash = require("lodash");

function FixedCostBlock(props) {
  let headerNames = ["Name", "Value"];

  return (
    <>
      <h3 className="text-center">Fixed costs</h3>
      <GeneralizedTable
        headerNames={headerNames}
        tableBody={<FixedCostTableBody {...props} />}
      />
    </>
  );
}

function FixedCostTableBody(props) {
  // Get electricity data from main process
  let data = JSON.parse(ipcRenderer.sendSync("get-data"));

  let productObj = lodash
    .chain(data)
    .get(props.type)
    .find({ nosaukums: props.nosaukums })
    .value();

  let electricityGeneral = lodash.chain(data).get("fiksētie").value();

  let electricityObj = productObj["fiksētie"];

  const [daudzums, setDaudzums] = useState(electricityObj["vien_daudzums"]);
  const [daudzumsValidated, setDaudzumsValidated] = useState(false);

  function daudzumsHandleChange(event) {
    setDaudzums(event.target.value);
  }

  function daudzumsHandleValidation(event) {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      setDaudzumsValidated(true);
    } else {
      setDaudzumsValidated(false);
      // Update the value
      electricityObj["vien_daudzums"] = parseFloat(daudzums);
      electricityObj["summa"] =
        electricityGeneral["vien_summa"] * electricityObj["vien_daudzums"];

      ipcRenderer.sendSync("modify-data", [JSON.stringify(data)]);
    }
  }

  return (
    <>
      <tbody>
        <tr className="align-middle">
          <td className="col-md-3 text-end">General price for one unit:</td>
          <td className="col-md-6">
            {electricityGeneral["vien_summa"].toFixed(
              globalSettings["floatPrecisionSecondary"]
            )}
          </td>
        </tr>
        <tr className="align-middle">
          <td className="text-end">Number of units:</td>
          <td>
            <Form noValidate validated={daudzumsValidated}>
              <Form.Group>
                <Form.Control
                  type="number"
                  required
                  placeholder="Кол-во"
                  value={daudzums}
                  onChange={daudzumsHandleChange}
                  onBlur={daudzumsHandleValidation}
                  style={{ width: "120px", height: "30px" }}
                />
                <Form.Control.Feedback type="invalid">
                  Type the amount
                </Form.Control.Feedback>
              </Form.Group>
            </Form>
          </td>
        </tr>
        <tr className="align-middle">
          <td className="text-end">Sum:</td>
          <td>
            {electricityObj["summa"].toFixed(
              globalSettings["floatPrecisionSecondary"]
            )}
          </td>
        </tr>
      </tbody>
    </>
  );
}

export default FixedCostBlock;
