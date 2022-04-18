import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

import Form from "react-bootstrap/Form";

import GeneralizedTable from "../GeneralizedTable";
import globalSettings from "../globalSettings";
import NavBar from "../NavBar/NavBar";

import "../App.css";

const { ipcRenderer } = window.require("electron");
const lodash = require("lodash");

function Electricity() {
  let headerNames = ["Name", "Value"];

  return (
    <>
      <NavBar />
      <h3 className="text-center">Electricity price</h3>
      <GeneralizedTable
        headerNames={headerNames}
        tableBody={<ElectricityTableBody />}
      />
    </>
  );
}

function productUpdate(vien_summa) {
  let tempData = JSON.parse(ipcRenderer.sendSync("get-data"));
  // Price per each product must be updated for each product
  let productObjects = lodash.chain(tempData).get("produkti").value();

  productObjects.forEach((product) => {
    let elektribaObj = product["elektriba"];
    elektribaObj["vien_summa"] = vien_summa;
    elektribaObj["summa"] =
      elektribaObj["vien_summa"] * elektribaObj["vien_daudzums"];
  });

  // Update data
  ipcRenderer.sendSync("modify-data", [JSON.stringify(tempData)]);
}

function ElectricityTableBody(props) {
  // Get electricity data from main process

  let data = JSON.parse(ipcRenderer.sendSync("get-data"));
  let electricityGeneral = lodash.chain(data).get("elektriba").value();

  const [cena, setCena] = useState(parseFloat(electricityGeneral["cena"]));
  const [cenaValidated, setCenaValidated] = useState(false);

  const [izlietota, setIzlietota] = useState(electricityGeneral["izlietota"]);
  const [izlietotaValidated, setIzlietotaValidated] = useState(false);

  const [daudzums, setDaudzums] = useState(electricityGeneral["vien_daudzums"]);
  const [daudzumsValidated, setDaudzumsValidated] = useState(false);

  const [summa, setSumma] = useState(parseFloat(electricityGeneral["summa"]));
  const [summaValidated, setSummaValidated] = useState(false);

  const [vienSumma, setVienSumma] = useState(
    parseFloat(electricityGeneral["vien_summa"])
  );
  const [vienSummaValidated, setVienSummaValidated] = useState(false);

  function cenaHandleChange(event) {
    setCena(event.target.value);
  }

  function izlietotaHandleChange(event) {
    setIzlietota(event.target.value);
  }

  function daudzumsHandleChange(event) {
    setDaudzums(event.target.value);
  }

  function summaHandleChange(event) {
    setSumma(event.target.value);
  }

  function vienSummaHandleChange(event) {
    setVienSumma(event.target.value);
  }

  function cenaHandleValidation(event) {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      setCenaValidated(true);
    } else {
      setCenaValidated(false);
      // We need to calculate the cost of electricity for one product
      // i.e. recalculate the total price (total electricity * cena)
      // And then price per each product (total price / products created)
      electricityGeneral["cena"] = parseFloat(cena);
      electricityGeneral["summa"] =
        electricityGeneral["izlietota"] * electricityGeneral["cena"];
      electricityGeneral["vien_summa"] =
        electricityGeneral["summa"] / electricityGeneral["vien_daudzums"];

      ipcRenderer.sendSync("modify-data", [JSON.stringify(data)]);

      productUpdate(electricityGeneral["vien_summa"]);
    }
  }

  function izlietotaHandleValidation(event) {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      setIzlietotaValidated(true);
    } else {
      setIzlietotaValidated(false);
      // Update the value
      electricityGeneral["izlietota"] = parseFloat(izlietota);
      electricityGeneral["summa"] =
        electricityGeneral["izlietota"] * electricityGeneral["cena"];
      electricityGeneral["vien_summa"] =
        electricityGeneral["summa"] / electricityGeneral["vien_daudzums"];

      ipcRenderer.sendSync("modify-data", [JSON.stringify(data)]);

      productUpdate(electricityGeneral["vien_summa"]);
    }
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
      electricityGeneral["vien_daudzums"] = parseFloat(daudzums);
      electricityGeneral["vien_summa"] =
        electricityGeneral["summa"] / electricityGeneral["vien_daudzums"];

      ipcRenderer.sendSync("modify-data", [JSON.stringify(data)]);

      productUpdate(electricityGeneral["vien_summa"]);
    }
  }

  function summaHandleValidation(event) {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      setSummaValidated(true);
    } else {
      setSummaValidated(false);
      // Update the value
      electricityGeneral["summa"] = parseFloat(summa);
      electricityGeneral["vien_summa"] =
        electricityGeneral["summa"] / electricityGeneral["vien_daudzums"];
      electricityGeneral["izlietota"] =
        electricityGeneral["summa"] / electricityGeneral["cena"];

      ipcRenderer.sendSync("modify-data", [JSON.stringify(data)]);

      productUpdate(electricityGeneral["vien_summa"]);
    }
  }

  function vienSummaHandleValidation(event) {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      setVienSummaValidated(true);
    } else {
      setVienSummaValidated(false);
      // Update the value
      electricityGeneral["vien_summa"] = parseFloat(vienSumma);
      electricityGeneral["summa"] =
        electricityGeneral["vien_summa"] * electricityGeneral["vien_daudzums"];
      electricityGeneral["izlietota"] =
        electricityGeneral["summa"] / electricityGeneral["cena"];

      ipcRenderer.sendSync("modify-data", [JSON.stringify(data)]);

      productUpdate(electricityGeneral["vien_summa"]);
    }
  }

  return (
    <>
      <tbody>
        <tr className="align-middle">
          <td className="col-md-3 text-end">Price per kW:</td>
          <td>
            <Form noValidate validated={cenaValidated}>
              <Form.Group>
                <Form.Control
                  type="number"
                  required
                  placeholder="e.g. 200"
                  value={cena}
                  onChange={cenaHandleChange}
                  onBlur={cenaHandleValidation}
                  style={{ width: "200px", height: "30px" }}
                />
                <Form.Control.Feedback type="invalid">
                  enter the price
                </Form.Control.Feedback>
              </Form.Group>
            </Form>
          </td>
          {/* <td className="col-md-6">{electricityObj["cena"].toFixed(globalSettings["floatPrecisionSecondary"])}</td> */}
        </tr>
        <tr className="align-middle">
          <td className="text-end">kWh spent:</td>
          <td>
            <Form noValidate validated={izlietotaValidated}>
              <Form.Group>
                <Form.Control
                  type="number"
                  required
                  placeholder="e.g. 200"
                  value={izlietota}
                  onChange={izlietotaHandleChange}
                  onBlur={izlietotaHandleValidation}
                  style={{ width: "200px", height: "30px" }}
                />
                <Form.Control.Feedback type="invalid">
                  enter the number
                </Form.Control.Feedback>
              </Form.Group>
            </Form>
          </td>
        </tr>
        <tr className="align-middle">
          <td className="text-end">Units produced:</td>
          <td>
            <Form noValidate validated={daudzumsValidated}>
              <Form.Group>
                <Form.Control
                  type="number"
                  required
                  placeholder="e.g. 10000"
                  value={daudzums}
                  onChange={daudzumsHandleChange}
                  onBlur={daudzumsHandleValidation}
                  style={{ width: "200px", height: "30px" }}
                />
                <Form.Control.Feedback type="invalid">
                  enter the number
                </Form.Control.Feedback>
              </Form.Group>
            </Form>
          </td>
        </tr>
        <tr className="align-middle">
          <td className="text-end">Electricity bill:</td>
          {/* <td>{electricityGeneral["summa"].toFixed(globalSettings["floatPrecisionSecondary"])}</td> */}
          <td>
            <Form noValidate validated={summaValidated}>
              <Form.Group>
                <Form.Control
                  type="number"
                  required
                  placeholder=""
                  value={summa}
                  onChange={summaHandleChange}
                  onBlur={summaHandleValidation}
                  style={{ width: "200px", height: "30px" }}
                />
                <Form.Control.Feedback type="invalid">
                  Введите количество
                </Form.Control.Feedback>
              </Form.Group>
            </Form>
          </td>
        </tr>
        <tr className="align-middle ">
          <td className="text-end">Price/unit:</td>
          <td>
            <Form noValidate validated={vienSummaValidated}>
              <Form.Group>
                <Form.Control
                  type="number"
                  required
                  placeholder="e.g. 0.3"
                  value={vienSumma}
                  onChange={vienSummaHandleChange}
                  onBlur={vienSummaHandleValidation}
                  style={{ width: "200px", height: "30px" }}
                />
                <Form.Control.Feedback type="invalid">
                  Введите количество
                </Form.Control.Feedback>
              </Form.Group>
            </Form>
          </td>
        </tr>
      </tbody>
    </>
  );
}

export default Electricity;
