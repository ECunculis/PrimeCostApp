import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import AddNewItemButton from "../AddNewItemButton";
import GeneralizedTable from "../GeneralizedTable";
import NavBar from "../NavBar/NavBar";

import "../App.css";

const { ipcRenderer } = window.require("electron");
const lodash = require("lodash");

function PackageAllPage() {
  let headerNames = ["Code", "Name", "Measure", "Price", "Remove"];

  return (
    <>
      <NavBar />
      <h3 className="text-center">Package</h3>
      <GeneralizedTable headerNames={headerNames} tableBody={<TableBody />} />
      <AddNewItemButton message={"package:ask-for-window"} />
    </>
  );
}

function TableBody(props) {
  // Get raw material data from main process
  let data = JSON.parse(ipcRenderer.sendSync("get-data"));
  data = lodash.chain(data).get("iepakojums").value();

  // Create the list
  let itemList = [];

  data.forEach((item) => {
    itemList.push(
      <tr key={item.nosaukums.toString()}>
        <td>{item.kods}</td>
        <td>{item.nosaukums}</td>
        <td>{item.mervieniba}</td>
        <td>
          <Cena item={item} {...props} />
        </td>
        <td>
          <DeleteRawButton nosaukums={item.nosaukums} {...props} />
        </td>
      </tr>
    );
  });

  return (
    <>
      <tbody>{itemList}</tbody>
    </>
  );
}

function Cena(props) {
  const [cena, setCena] = useState(parseFloat(props.item.cena));
  const [validated, setValidated] = useState(false);

  function handleChange(event) {
    setCena(event.target.value);
  }
  function handleValidation(event) {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      setValidated(true);
    } else {
      setValidated(false);
      // Update the value
      let data = JSON.parse(ipcRenderer.sendSync("get-data"));
      lodash
        .chain(data)
        .get("iepakojums")
        .find({ nosaukums: props.item.nosaukums })
        .assign({ cena: parseFloat(cena) })
        .value();

      // We need to update the value everythere i.e. in all groups and all products
      // which have this specific expense in the list

      // Get all products
      let productObjects = lodash.chain(data).get("produkti").value();

      // Get all grupas
      let groupObjects = lodash.chain(data).get("grupas").value();

      productObjects.forEach((product) => {
        // Get object
        let iepakObj = lodash.chain(product).get("iepakojums").value();

        let daudzums = lodash.chain(iepakObj).get("daudzums").value();

        let element = lodash
          .chain(iepakObj)
          .get("elementi")
          .find({ nosaukums: props.item.nosaukums })
          .value();

        // If object exists
        if (element !== undefined) {
          let summa_iepak = cena * element["norma"];
          let summa_vien = summa_iepak / daudzums;

          lodash
            .chain(element)
            .assign({ cena: parseFloat(cena) })
            .assign({ summa_iepak: parseFloat(summa_iepak) })
            .assign({ summa_vien: parseFloat(summa_vien) })
            .value();
        }
      });

      groupObjects.forEach((group) => {
        // Get object
        let iepakObj = lodash.chain(group).get("iepakojums").value();

        let daudzums = lodash.chain(iepakObj).get("daudzums").value();

        let element = lodash
          .chain(iepakObj)
          .get("elementi")
          .find({ nosaukums: props.item.nosaukums })
          .value();

        // If object exists
        if (element !== undefined) {
          let summa_iepak = cena * element["norma"];
          let summa_vien = summa_iepak / daudzums;

          lodash
            .chain(element)
            .assign({ cena: parseFloat(cena) })
            .assign({ summa_iepak: parseFloat(summa_iepak) })
            .assign({ summa_vien: parseFloat(summa_vien) })
            .value();
        }
      });

      // Update data
      ipcRenderer.sendSync("modify-data", [JSON.stringify(data)]);
    }
  }
  return (
    <Form noValidate validated={validated}>
      <Form.Group>
        <Form.Control
          type="number"
          required
          placeholder="Цена"
          value={cena}
          onChange={handleChange}
          onBlur={handleValidation}
        />
        <Form.Control.Feedback type="invalid">
          Введите цену
        </Form.Control.Feedback>
      </Form.Group>
    </Form>
  );
}

function DeleteRawButton(props) {
  function handleClick() {
    let data = JSON.parse(ipcRenderer.sendSync("get-data"));

    ipcRenderer.send("warning-delete");
    ipcRenderer.on("confirm-delete", (event, arg) => {
      lodash
        .chain(data)
        .get("iepakojums")
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

export default PackageAllPage;
