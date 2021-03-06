import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import AddNewItemButton from "../AddNewItemButton";
import GeneralizedTable from "../GeneralizedTable";
import NavBar from "../NavBar/NavBar";

import "../App.css";

import globalSettings from "../globalSettings";

const { ipcRenderer } = window.require("electron");
const lodash = require("lodash");

function WorkersAllPage() {
  let headerNames = ["Name", "Salary", "% Fraction", "Sum", "Remove"];

  return (
    <>
      <NavBar />
      <h3 className="text-center">Workers list</h3>
      <Nodoklis />
      <GeneralizedTable headerNames={headerNames} tableBody={<TableBody />} />
      <AddNewItemButton message={"workers:ask-for-window"} />
    </>
  );
}

function Nodoklis(props) {
  let data = JSON.parse(ipcRenderer.sendSync("get-data"));

  const [nodoklis, setNodoklis] = useState(data["darbinieku_nodoklis"]);
  const [nodoklisValidated, setNodoklisValidated] = useState(false);

  function handleChange(event) {
    setNodoklis(event.target.value);
  }

  function handleValidation(event) {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      setNodoklisValidated(true);
    } else {
      setNodoklisValidated(false);
      // Update the values
      let data = JSON.parse(ipcRenderer.sendSync("get-data"));

      data["darbinieku_nodoklis"] = nodoklis;
      let darbinieki = data["darbinieki"];

      // Get all products
      let productObjects = lodash.chain(data).get("produkti").value();

      // Get all grupas
      let groupObjects = lodash.chain(data).get("grupas").value();

      darbinieki.forEach((item) => {
        // Update data in the general list
        item["alga_procents"] = (item["alga"] * nodoklis) / 100;
        item["alga_nodoklis"] = item["alga"] + item["alga_procents"];

        // Update the alga for each darbinieks everywhere
        productObjects.forEach((product) => {
          // Get object
          let razGrupas = lodash.chain(product).get("ra??o??anas_grupas").value();

          razGrupas.forEach((razGroup) => {
            let daudzums = razGroup["daudzums"];
            let darbinieks = lodash
              .chain(razGroup)
              .get("darbinieki")
              .find({ nosaukums: item.nosaukums })
              .value();

            // If object exists
            if (darbinieks !== undefined) {
              // Update the workers data in the product or group
              darbinieks["alga_nodoklis"] = item["alga_nodoklis"];
              darbinieks["summa"] = item["alga_nodoklis"] * darbinieks["norma"];
              darbinieks["summa_vien"] = darbinieks["summa"] / daudzums;
            }
          });
        });
      });

      ipcRenderer.sendSync("modify-data", [JSON.stringify(data)]);
    }
  }

  return (
    <>
      <Form noValidate validated={nodoklisValidated}>
        <Form.Group>
          <Form.Label>Salary tax(%)</Form.Label>
          <Form.Control
            id="daudzums"
            type="number"
            required
            placeholder="??????-????"
            value={nodoklis}
            onChange={handleChange}
            onBlur={handleValidation}
          />
          <Form.Control.Feedback type="invalid">
            ?????????????? ??????????
          </Form.Control.Feedback>
        </Form.Group>
      </Form>
    </>
  );
}

function TableBody(props) {
  let data = JSON.parse(ipcRenderer.sendSync("get-data"));
  data = lodash.chain(data).get("darbinieki").value();

  // Create the list
  let itemList = [];

  data.forEach((item) => {
    itemList.push(
      <tr key={item.nosaukums.toString()}>
        <td>{item.nosaukums}</td>
        <td>
          <Alga item={item} {...props} />
        </td>
        <td>
          {item.alga_procents.toFixed(
            globalSettings["floatPrecisionSecondary"]
          )}
        </td>
        <td>
          {item.alga_nodoklis.toFixed(
            globalSettings["floatPrecisionSecondary"]
          )}
        </td>
        <td>
          <DeleteButton nosaukums={item.nosaukums} {...props} />
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

function Alga(props) {
  const [alga, setAlga] = useState(parseFloat(props.item.alga));
  const [validated, setValidated] = useState(false);

  function handleChange(event) {
    setAlga(event.target.value);
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
      let nodoklis = data["darbinieku_nodoklis"];

      let darbinieksObj = lodash
        .chain(data)
        .get("darbinieki")
        .find({ nosaukums: props.item.nosaukums })
        .value();

      darbinieksObj["alga"] = parseFloat(alga);
      darbinieksObj["alga_procents"] = (darbinieksObj["alga"] * nodoklis) / 100;
      darbinieksObj["alga_nodoklis"] =
        darbinieksObj["alga"] + darbinieksObj["alga_procents"];

      // We need to update the value everythere i.e. in all groups and all products
      // which have this specific expense in the list

      // Get all products
      let productObjects = lodash.chain(data).get("produkti").value();

      // Get all grupas
      let groupObjects = lodash.chain(data).get("grupas").value();

      productObjects.forEach((product) => {
        // Get object
        let razGrupas = lodash.chain(product).get("ra??o??anas_grupas").value();

        razGrupas.forEach((razGroup) => {
          let daudzums = razGroup["daudzums"];

          let darbinieks = lodash
            .chain(razGroup)
            .get("darbinieki")
            .find({ nosaukums: props.item.nosaukums })
            .value();

          // If object exists
          if (darbinieks !== undefined) {
            darbinieks["alga"] = darbinieksObj["alga"];
            darbinieks["alga_nodoklis"] = darbinieksObj["alga_nodoklis"];
            darbinieks["summa"] =
              darbinieks["alga_nodoklis"] * darbinieks["norma"];
            darbinieks["summa_vien"] = darbinieks["summa"] / daudzums;
          }
        });
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
          placeholder="????????"
          value={alga}
          onChange={handleChange}
          onBlur={handleValidation}
        />
        <Form.Control.Feedback type="invalid">
          ?????????????? ????????????
        </Form.Control.Feedback>
      </Form.Group>
    </Form>
  );
}

function DeleteButton(props) {
  function handleClick() {
    let data = JSON.parse(ipcRenderer.sendSync("get-data"));

    ipcRenderer.send("warning-delete");
    ipcRenderer.on("confirm-delete", (event, arg) => {
      lodash
        .chain(data)
        .get("darbinieki")
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

export default WorkersAllPage;
