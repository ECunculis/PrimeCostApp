import React, { useState } from "react";
// import './App.css';
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

let fileName = "/..";

function PackageBlock(props) {
  const headerNames = [
    "Code",
    "Name",
    "Measure",
    "Price",
    "Amount",
    "Sum/package",
    "Price/unit",
    "Remove",
  ];

  // Get vienibas daudzums
  let data = JSON.parse(ipcRenderer.sendSync("get-data"));
  let vienDaudzumsTemp = lodash
    .chain(data)
    .get(props.type)
    .find({ nosaukums: props.nosaukums })
    .get("iepakojums")
    .get("daudzums")
    .value();

  // Get the vien daudzums
  const [vienDaudzums, setVienDaudzums] = useState(
    parseFloat(vienDaudzumsTemp)
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
      // Update the values
      let newVienDaudzums = event.target.value;
      let data = JSON.parse(ipcRenderer.sendSync("get-data"));

      let packageObj = lodash
        .chain(data)
        .get(props.type)
        .find({ nosaukums: props.nosaukums })
        .get("iepakojums")
        .value();

      let elementi = packageObj["elementi"];

      packageObj["daudzums"] = parseFloat(newVienDaudzums);

      // Update the summa_vien entry for each item
      elementi.forEach((item) => {
        item["summa_vien"] = item["summa_iepak"] / packageObj["daudzums"];
      });

      ipcRenderer.sendSync("modify-data", [JSON.stringify(data)]);
    }
  }

  function vienDaudzumsHandleChange(event) {
    setVienDaudzums(event.target.value);
  }

  return (
    <>
      <h3 className="text-center">Package</h3>
      <PackageSize
        validated={vienDaudzumsValidated}
        vienDaudzums={vienDaudzums}
        vienDaudzumsHandleChange={vienDaudzumsHandleChange}
        vienDaudzumsHandleValidation={(e) => vienDaudzumsHandleValidation(e)}
        fileName={props.fileName}
      />
      <GeneralizedTable
        headerNames={headerNames}
        tableBody={<PackageTableBody vienDaudzums={vienDaudzums} {...props} />}
      />
      <AddNewItemDropdown nosaukums={props.nosaukums} type={props.type} />
    </>
  );
}

function PackageSize(props) {
  return (
    <Container fluid>
      <Form noValidate validated={props.validated}>
        <Form.Group as={Row}>
          <Col md="4">
            <div className="text-end">
              <Form.Label>Number of units in one package:</Form.Label>
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

function PackageTableBody(props) {
  let data = JSON.parse(ipcRenderer.sendSync("get-data"));
  let expenses = lodash
    .chain(data)
    .get(props.type)
    .find({ nosaukums: props.nosaukums })
    .get("iepakojums")
    .get("elementi")
    .value();

  // let expenses = JSON.parse(data)
  let componentList = [];
  let summaIepak = 0;
  let summaVien = 0;

  // Make the list of components
  expenses.forEach((item) => {
    componentList.push(
      <PackageProductTableEntry
        {...props}
        key={item.nosaukums}
        item={item}
        productName={props.nosaukums}
        fileName={fileName}
      />
    );

    summaIepak += item["summa_iepak"];
    summaVien += item["summa_vien"];
  });

  return (
    <tbody>
      {componentList}
      <tr>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td className="text-end fw-bold">Sum:</td>
        <td>{summaIepak.toFixed(globalSettings["floatPrecisionSecondary"])}</td>
        <td>{summaVien.toFixed(globalSettings["floatPrecisionSecondary"])}</td>
      </tr>
    </tbody>
  );
}

function PackageProductTableEntry(props) {
  const [cena, setCena] = useState(parseFloat(props.item.cena));
  const [cenaValidated, setCenaValidated] = useState(false);

  const [norma, setNorma] = useState(parseFloat(props.item.norma));
  const [normaValidated, setNormaValidated] = useState(false);

  const [summaIepak, setSummaIepak] = useState(parseFloat(norma * cena));
  const [summaVien, setSummaVien] = useState(summaIepak / props.vienDaudzums);

  function cenaHandleValidation(fileName, event) {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      setCenaValidated(true);
    } else {
      setCenaValidated(false);

      let newSummaIepak = norma * cena;
      let newSummaVien = newSummaIepak / props.vienDaudzums;
      // Update the value
      setSummaIepak(newSummaIepak);
      setSummaVien(newSummaVien);

      console.log(cena);
      console.log(norma);
      console.log(newSummaIepak);
      console.log(newSummaVien);

      let data = JSON.parse(ipcRenderer.sendSync("get-data"));
      lodash
        .chain(data)
        .get(props.type)
        .find({ nosaukums: props.productName })
        .get("iepakojums")
        .get("elementi")
        .find({ nosaukums: props.item.nosaukums })
        .assign({ summa_iepak: parseFloat(newSummaIepak) })
        .assign({ summa_vien: parseFloat(newSummaVien) })
        .assign({ cena: parseFloat(cena) })
        .value();
      ipcRenderer.sendSync("modify-data", [JSON.stringify(data)]);
    }
  }

  function normaHandleValidation(fileName, event) {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      setNormaValidated(true);
    } else {
      setNormaValidated(false);
      // Update the value
      let newSummaIepak = norma * cena;
      let newSummaVien = newSummaIepak / props.vienDaudzums;

      let data = JSON.parse(ipcRenderer.sendSync("get-data"));
      lodash
        .chain(data)
        .get(props.type)
        .find({ nosaukums: props.productName })
        .get("iepakojums")
        .get("elementi")
        .find({ nosaukums: props.item.nosaukums })
        .assign({ summa_iepak: parseFloat(newSummaIepak) })
        .assign({ summa_vien: parseFloat(newSummaVien) })
        .assign({ norma: parseFloat(norma) })
        .value();
      ipcRenderer.sendSync("modify-data", [JSON.stringify(data)]);
    }
  }

  function cenaHandleChange(event) {
    setCena(event.target.value);
  }
  function normaHandleChange(event) {
    setNorma(event.target.value);
  }

  return (
    <tr className="align-middle">
      <td>{props.item.kods}</td>
      <td>{props.item.nosaukums}</td>
      <td>{props.item.mervieniba}</td>
      <td>
        <Cena
          validated={cenaValidated}
          cena={cena}
          handleChange={cenaHandleChange}
          handleValidation={(e) => cenaHandleValidation(props.fileName, e)}
          fileName={props.fileName}
        />
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
      <td>{summaIepak.toFixed(globalSettings["floatPrecisionSecondary"])}</td>
      <td>{summaVien.toFixed(globalSettings["floatPrecisionSecondary"])}</td>
      <td>
        <DeletePackageEntryButton
          packageName={props.item.nosaukums}
          productName={props.productName}
          fileName={props.fileName}
          {...props}
        />
      </td>
    </tr>
  );
}

function Cena(props) {
  return (
    <Form noValidate validated={props.validated}>
      <Form.Group>
        <Form.Control
          id="cena"
          type="number"
          required
          placeholder="Цена"
          value={props.cena}
          onChange={props.handleChange}
          onBlur={props.handleValidation}
          style={{ width: "120px", height: "28px" }}
        />
        <Form.Control.Feedback type="invalid">
          Введите цену
        </Form.Control.Feedback>
      </Form.Group>
    </Form>
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
          style={{ width: "120px", height: "28px" }}
        />
        <Form.Control.Feedback type="invalid">
          Введите количество
        </Form.Control.Feedback>
      </Form.Group>
    </Form>
  );
}

function DeletePackageEntryButton(props) {
  function handleClick() {
    let data = JSON.parse(ipcRenderer.sendSync("get-data"));

    ipcRenderer.send("warning-delete");
    ipcRenderer.on("confirm-delete", (event, arg) => {
      lodash
        .chain(data)
        .get(props.type)
        .find({ nosaukums: props.productName })
        .get("iepakojums")
        .get("elementi")
        .remove({ nosaukums: props.packageName })
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
      удалить
    </Button>
  );
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
      <Dropdown>
        <Dropdown.Toggle variant="secondary" id="dropdown-basic" size="sm">
          Добавить из
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item
            onClick={(e) =>
              handleGeneral(e, {
                to: "produkti",
                from: "iepakojums",
                type: "all",
              })
            }
          >
            Общий список
          </Dropdown.Item>
          <Dropdown.Item
            onClick={(e) =>
              handleGeneral(e, {
                to: "produkti",
                from: "iepakojums",
                type: "group",
              })
            }
          >
            Список группы
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );
  } else if (props.type === "grupas") {
    dropDownButton = (
      <Button
        variant="secondary"
        size="sm"
        onClick={(e) =>
          handleGeneral(e, { to: "grupas", from: "iepakojums", type: "all" })
        }
      >
        Добавить
      </Button>
    );
  }

  return <div className="addEntryButtons">{dropDownButton}</div>;
}

export default PackageBlock;
