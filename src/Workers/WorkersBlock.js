import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Dropdown from "react-bootstrap/Dropdown";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import globalSettings from "../globalSettings";
import GeneralizedTable from "../GeneralizedTable";

const { ipcRenderer } = window.require("electron");
const lodash = require("lodash");

function WorkersBlock(props) {
  let data = JSON.parse(ipcRenderer.sendSync("get-data"));

  let razosanasGrupas = lodash
    .chain(data)
    .get(props.type)
    .find({ nosaukums: props.nosaukums })
    .get("ražošanas_grupas")
    .value();

  let componentList = [];

  razosanasGrupas.forEach((item) => {
    componentList.push(
      <ProductionGroupBlock
        {...props}
        key={item.nosaukums}
        item={item}
        productName={props.nosaukums}
      />
    );
  });

  return (
    <>
      <h3 className="text-center">Salary</h3>
      {componentList}
      <AddNewRazGrupaDropdown productName={props.nosaukums} {...props} />
    </>
  );
}

function ProductionGroupBlock(props) {
  let data = JSON.parse(ipcRenderer.sendSync("get-data"));

  let nodoklis = lodash.chain(data).get("darbinieku_nodoklis").value();

  let headerNames = [
    "Worker",
    "Salary",
    "Salary with tax (" + nodoklis + "%)",
    "Hours worked",
    "Sum",
    "Expence/unit",
    "Remove",
  ];

  // // Get the vien daudzums
  const [vienDaudzums, setVienDaudzums] = useState(
    parseFloat(props.item.daudzums)
  );
  const [vienDaudzumsValidated, setVienDaudzumsValidated] = useState(false);

  function vienDaudzumsHandleValidation(event) {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      setVienDaudzumsValidated(true);
    } else {
      setVienDaudzumsValidated(false);
      // Update the value
      let newVienDaudzums = event.target.value;

      let data = JSON.parse(ipcRenderer.sendSync("get-data"));

      let razGrupaObj = lodash
        .chain(data)
        .get(props.type)
        .find({ nosaukums: props.productName })
        .get("ražošanas_grupas")
        .find({ nosaukums: props.item.nosaukums })
        .value();

      let darbinieki = razGrupaObj["darbinieki"];

      razGrupaObj["daudzums"] = parseFloat(newVienDaudzums);

      // Update the summa_vien entry for each item
      darbinieki.forEach((item) => {
        item["summa_vien"] = item["summa"] / razGrupaObj["daudzums"];
      });

      ipcRenderer.sendSync("modify-data", [JSON.stringify(data)]);
    }
  }

  function vienDaudzumsHandleChange(event) {
    setVienDaudzums(event.target.value);
  }

  return (
    <>
      <h4 className="text-center">{props.item.nosaukums}</h4>
      <Amount
        validated={vienDaudzumsValidated}
        vienDaudzums={vienDaudzums}
        vienDaudzumsHandleChange={vienDaudzumsHandleChange}
        vienDaudzumsHandleValidation={(e) => vienDaudzumsHandleValidation(e)}
      />
      <GeneralizedTable
        headerNames={headerNames}
        tableBody={
          <WorkersTableBody
            vienDaudzums={vienDaudzums}
            razGrupNosaukums={props.item.nosaukums}
            {...props}
          />
        }
      />
      <AddNewItemDropdown
        nosaukums={props.nosaukums}
        type={props.type}
        {...props}
      />
      <DeleteRazGrupasButton
        {...props}
        razGrupNosaukums={props.item.nosaukums}
      />
    </>
  );
}

function Amount(props) {
  return (
    <Container fluid>
      <Form noValidate validated={props.validated}>
        <Form.Group as={Row}>
          <Col md="4">
            <div className="text-end">
              <Form.Label>Number of units produced:</Form.Label>
            </div>
          </Col>
          <Col>
            <Form.Control
              id="daudzums"
              type="number"
              required
              placeholder="Кол-во"
              value={props.vienDaudzums}
              onChange={props.vienDaudzumsHandleChange}
              onBlur={props.vienDaudzumsHandleValidation}
              style={{ width: "120px", height: "30px" }}
            />
            <Form.Control.Feedback type="invalid">
              Введите количество
            </Form.Control.Feedback>
          </Col>
        </Form.Group>
      </Form>
    </Container>
  );
}

function WorkersTableBody(props) {
  let workers = props.item.darbinieki;
  let componentList = [];

  let summa = 0.0;
  let summa_vien = 0.0;

  // Make the list of components
  workers.forEach((item) => {
    componentList.push(
      <WorkersTableEntry
        {...props}
        key={item.nosaukums}
        razGrupNosaukums={props.razGrupNosaukums}
        item={item}
        productName={props.nosaukums}
      />
    );
    summa += item["summa"];
    summa_vien += item["summa_vien"];
  });

  return (
    <tbody>
      {componentList}
      <tr className="align-middle">
        <td></td>
        <td></td>
        <td></td>
        <td className="text-end fw-bold">Sum:</td>
        <td>{summa.toFixed(globalSettings["floatPrecisionSecondary"])}</td>
        <td>{summa_vien.toFixed(globalSettings["floatPrecisionSecondary"])}</td>
      </tr>
    </tbody>
  );
}

function WorkersTableEntry(props) {
  const [norma, setNorma] = useState(parseFloat(props.item.norma));
  const [normaValidated, setNormaValidated] = useState(false);

  const [summa] = useState(parseFloat(props.item.summa));
  const [summaVien] = useState(summa / props.vienDaudzums);

  function normaHandleValidation(fileName, event) {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      setNormaValidated(true);
    } else {
      setNormaValidated(false);

      let data = JSON.parse(ipcRenderer.sendSync("get-data"));
      let darbinieksObj = lodash
        .chain(data)
        .get(props.type)
        .find({ nosaukums: props.productName })
        .get("ražošanas_grupas")
        .find({ nosaukums: props.razGrupNosaukums })
        .get("darbinieki")
        .find({ nosaukums: props.item.nosaukums })
        .value();

      // Update the value
      let newSumma = norma * darbinieksObj["alga_nodoklis"];
      let newSummaVien = newSumma / props.vienDaudzums;

      lodash
        .chain(darbinieksObj)
        .assign({ summa: parseFloat(newSumma) })
        .assign({ summa_vien: parseFloat(newSummaVien) })
        .assign({ norma: parseFloat(norma) })
        .value();
      ipcRenderer.sendSync("modify-data", [JSON.stringify(data)]);
    }
  }

  function normaHandleChange(event) {
    setNorma(event.target.value);
  }

  return (
    <tr className="align-middle">
      <td>{props.item.nosaukums}</td>
      <td>{props.item.alga}</td>
      <td>
        {props.item.alga_nodoklis.toFixed(
          globalSettings["floatPrecisionSecondary"]
        )}
      </td>
      <td>
        <Norma
          validated={normaValidated}
          norma={norma}
          handleChange={normaHandleChange}
          handleValidation={(e) => normaHandleValidation(props.fileName, e)}
          fileName={props.fileName}
        />
      </td>
      <td>{summa.toFixed(globalSettings["floatPrecisionSecondary"])}</td>
      <td>{summaVien.toFixed(globalSettings["floatPrecisionSecondary"])}</td>
      <td>
        <DeleteWorkersEntryButton {...props} />
      </td>
    </tr>
  );
}

function Norma(props) {
  return (
    <Form noValidate validated={props.validated}>
      <Form.Group>
        <Form.Control
          id="daudzums"
          type="number"
          required
          placeholder="Кол-во"
          value={props.norma}
          onChange={props.handleChange}
          onBlur={props.handleValidation}
          style={{ width: "120px", height: "30px" }}
        />
        <Form.Control.Feedback type="invalid">
          Введите количество
        </Form.Control.Feedback>
      </Form.Group>
    </Form>
  );
}

function DeleteWorkersEntryButton(props) {
  function handleClick() {
    let data = JSON.parse(ipcRenderer.sendSync("get-data"));

    ipcRenderer.send("warning-delete");
    ipcRenderer.on("confirm-delete", (event, arg) => {
      lodash
        .chain(data)
        .get(props.type)
        .find({ nosaukums: props.productName })
        .get("ražošanas_grupas")
        .find({ nosaukums: props.razGrupNosaukums })
        .get("darbinieki")
        .remove({ nosaukums: props.item.nosaukums })
        .value();
      ipcRenderer.sendSync("modify-data", [JSON.stringify(data)]);
    });
  }
  return (
    <Button
      variant="danger"
      size="sm"
      onClick={(e) => handleClick(props.fileName, e)}
    >
      remove
    </Button>
  );
}

function DeleteRazGrupasButton(props) {
  function handleClick() {
    let data = JSON.parse(ipcRenderer.sendSync("get-data"));

    ipcRenderer.send("warning-delete");
    ipcRenderer.on("confirm-delete", (event, arg) => {
      lodash
        .chain(data)
        .get(props.type)
        .find({ nosaukums: props.productName })
        .get("ražošanas_grupas")
        .remove({ nosaukums: props.razGrupNosaukums })
        .value();
      ipcRenderer.sendSync("modify-data", [JSON.stringify(data)]);
    });
  }
  return (
    <Button
      variant="danger"
      size="sm"
      onClick={(e) => handleClick(props.fileName, e)}
    >
      Remove group
    </Button>
  );
}

function AddNewRazGrupaDropdown(props) {
  function handleGeneral(event) {
    let info = { to: "produkti", from: "ražošanas_grupas", type: "group" };

    ipcRenderer.send("expenses-add-window", [
      props.nosaukums,
      JSON.stringify(info),
    ]);
  }

  function handleCreateNew(event, info) {
    ipcRenderer.send("razGrupas:ask-for-window", [JSON.stringify(info)]);
  }

  let dropDownButton = "";
  if (props.type === "produkti") {
    dropDownButton = (
      <Button
        variant="secondary"
        size="sm"
        onClick={(e) =>
          handleCreateNew(e, {
            productName: props.productName,
            type: "produkti",
          })
        }
      >
        Add manufacturing group
      </Button>
    );
  }

  return <div className="addEntryButtons">{dropDownButton}</div>;
}

function AddNewItemDropdown(props) {
  function handleGeneral(event, type) {
    ipcRenderer.send("expenses-add-window", [
      props.nosaukums,
      JSON.stringify(type),
    ]);
  }

  let dropDownButton = "";
  if (props.type === "produkti") {
    dropDownButton = (
      <Button
        variant="secondary"
        size="sm"
        onClick={(e) =>
          handleGeneral(e, {
            to: "produkti",
            from: "darbinieki",
            type: "all",
            raz_grupas_nosaukums: props.item.nosaukums,
          })
        }
      >
        Add new worker
      </Button>
    );
  } else if (props.type === "grupas") {
    dropDownButton = (
      <Button
        variant="secondary"
        size="sm"
        onClick={(e) =>
          handleGeneral(e, {
            to: "grupas",
            from: "darbinieki",
            type: "all",
            raz_grupas_nosaukums: props.item.nosaukums,
          })
        }
      >
        Add new worker
      </Button>
    );
  }

  return <div className="addEntryButtons">{dropDownButton}</div>;
}

export default WorkersBlock;
