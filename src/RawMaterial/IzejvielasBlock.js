import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import globalSettings from "../globalSettings";
import GeneralizedTable from "../GeneralizedTable";
import AddNewItemDropdown from "../AddNewItemDropdown";

import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";

const { ipcRenderer } = window.require("electron");
const lodash = require("lodash");

function IzejvielasBlock(props) {
  const headerNames = [
    "Code",
    "Name",
    "Measure",
    "Price",
    "Amount",
    "Price/unit",
    "Remove",
  ];

  return (
    <>
      <h3 className="text-center">Raw materials</h3>
      <GeneralizedTable
        headerNames={headerNames}
        tableBody={<IzejvielasTableBody {...props} />}
      />
      <AddNewItemDropdown
        nosaukums={props.nosaukums}
        type={props.type}
        from={"izejvielas"}
      />
    </>
  );
}

function IzejvielasTableBody(props) {
  // Get raw material data from main process
  let data = JSON.parse(ipcRenderer.sendSync("get-data"));

  let izejvielas = lodash
    .chain(data)
    .get(props.type)
    .find({ nosaukums: props.nosaukums })
    .get("izejvielas")
    .value();

  let componentList = [];
  let summa = 0.0;
  let normaSumma = 0.0;

  // Make the list of components
  izejvielas.forEach((item) => {
    componentList.push(
      <IzejvielaProductTableEntry
        key={item.nosaukums}
        item={item}
        productName={props.nosaukums}
        {...props}
      />
    );
    summa += item["kopuma"];
    if (item["mervieniba"] !== "gab") {
      normaSumma += item["daudzums"];
    }
  });

  return (
    <tbody>
      {componentList}
      <tr>
        <td></td>
        <td></td>
        <td></td>
        <td className="text-end fw-bold">Sum:</td>
        <td>{parseFloat(normaSumma).toFixed(2) + " (kg, l)"}</td>
        <td>
          {parseFloat(summa).toFixed(globalSettings["floatPrecisionSecondary"])}
        </td>
      </tr>
    </tbody>
  );
}

function IzejvielaProductTableEntry(props) {
  const [cena, setCena] = useState(parseFloat(props.item.cena));
  const [cenaValidated, setCenaValidated] = useState(false);

  const [daudzums, setDaudzums] = useState(parseFloat(props.item.daudzums));
  const [daudzumsValidated, setDaudzumsValidated] = useState(false);

  let kopuma = parseFloat(props.item.kopuma);

  function cenaHandleValidation(fileName, event) {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      setCenaValidated(true);
    } else {
      setCenaValidated(false);
      // Update the value
      let newKopuma = daudzums * cena;

      let data = JSON.parse(ipcRenderer.sendSync("get-data"));
      lodash
        .chain(data)
        .get(props.type)
        .find({ nosaukums: props.productName })
        .get("izejvielas")
        .find({ nosaukums: props.item.nosaukums })
        .assign({ cena: parseFloat(cena) })
        .assign({ kopuma: parseFloat(newKopuma) })
        .value();
      ipcRenderer.sendSync("modify-data", [JSON.stringify(data)]);
    }
  }

  function daudzumsHandleValidation(fileName, event) {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      setDaudzumsValidated(true);
    } else {
      setDaudzumsValidated(false);
      // Update the value
      let newDaudzums = event.target.value;
      let newKopuma = newDaudzums * cena;

      let data = JSON.parse(ipcRenderer.sendSync("get-data"));
      lodash
        .chain(data)
        .get(props.type)
        .find({ nosaukums: props.productName })
        .get("izejvielas")
        .find({ nosaukums: props.item.nosaukums })
        .assign({ daudzums: parseFloat(newDaudzums) })
        .assign({ kopuma: parseFloat(newKopuma) })
        .value();

      ipcRenderer.sendSync("modify-data", [JSON.stringify(data)]);
    }
  }

  function cenaHandleChange(event) {
    setCena(event.target.value);
  }

  function daudzumsHandleChange(event) {
    setDaudzums(event.target.value);
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
        <Daudzums
          validated={daudzumsValidated}
          daudzums={daudzums}
          handleChange={daudzumsHandleChange}
          handleValidation={(e) => daudzumsHandleValidation(props.fileName, e)}
          fileName={props.fileName}
        />
      </td>
      <td>
        {parseFloat(kopuma).toFixed(globalSettings["floatPrecision"] + 1)}
      </td>
      <td>
        <DeleteIzejvielaEntryButton
          izejvielaName={props.item.nosaukums}
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
    <Container>
      <Row>
        <Col>
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
        </Col>
      </Row>
    </Container>
  );
}

function Daudzums(props) {
  return (
    <Form noValidate validated={props.validated}>
      <Form.Group>
        <Form.Control
          id="daudzums"
          type="number"
          required
          placeholder="Кол-во"
          value={props.daudzums}
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

function DeleteIzejvielaEntryButton(props) {
  function handleClick() {
    let izejvielaName = props.izejvielaName;

    let data = JSON.parse(ipcRenderer.sendSync("get-data"));

    ipcRenderer.send("warning-delete");
    ipcRenderer.on("confirm-delete", (event, arg) => {
      lodash
        .chain(data)
        .get(props.type)
        .find({ nosaukums: props.productName })
        .get("izejvielas")
        .remove({ nosaukums: izejvielaName })
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

export default IzejvielasBlock;
