import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";

import { useParams } from "react-router-dom";

// import globalSettings from '../globalSettings';

const { ipcRenderer } = window.require("electron");
const lodash = require("lodash");

function RazGrupasAddPage(props) {
  let { productName, type } = useParams();

  return <RazGrupasAddClass productName={productName} type={type} />;
}

class RazGrupasAddClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nosaukums: "",
      alga: "",
      showAlert: false,
      alertMessage: "",
    };

    this.data = {};

    this.handleNameChange = this.handleNameChange.bind(this);

    this.setShowAlert = this.setShowAlert.bind(this);
    this.setAlertMessage = this.setAlertMessage.bind(this);
  }

  handleNameChange(event) {
    this.setState({ nosaukums: event.target.value });
  }

  setShowAlert(value) {
    this.setState({ showAlert: value });
  }
  setAlertMessage(value) {
    this.setState({ alertMessage: value });
  }

  render(props) {
    return (
      <>
        <InputAlert
          showAlert={this.state.showAlert}
          alertMessage={this.state.alertMessage}
          onClose={() => this.setShowAlert(false)}
        />
        <InputForm
          nosaukums={this.state.nosaukums}
          handleNameChange={this.handleNameChange}
          setShowAlert={this.setShowAlert}
          setAlertMessage={this.setAlertMessage}
          {...this.props}
        />
      </>
    );
  }
}

function InputAlert(props) {
  if (props.showAlert) {
    return (
      <Alert variant="danger" onClose={props.onClose} dismissible>
        {props.alertMessage}
      </Alert>
    );
  }
  return null;
}

// function isNumeric(str) {
//     if (typeof str != "string") return false // we only process strings!
//     return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
//            !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
// }

class InputForm extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();

    // let sourceFileName

    // if (this.props.type === "product") {
    //     sourceFileName = "/.." + globalSettings["productsFileName"]
    // } else if (this.props.type === "group") {
    //     sourceFileName = "/.." + globalSettings["groupsFileName"]
    // }

    // let productObj = {key:"nosaukums", value:this.props.productName}
    // Check the input correctness
    // this.data = ipcRenderer.sendSync('get', [
    //     [JSON.stringify(productObj), "ražošanas_grupas"],
    //     [0,1],
    //     sourceFileName
    // ]);
    // this.data = JSON.parse(this.data)

    this.data = JSON.parse(ipcRenderer.sendSync("get-data"));
    this.data = lodash
      .chain(this.data)
      .get(this.props.type)
      .find({ nosaukums: this.props.productName })
      .get("ražošanas_grupas")
      .value();

    // Check if empty
    if (this.props.nosaukums === "") {
      this.props.setShowAlert(true);
      this.props.setAlertMessage("Введите данные");
    } else {
      // Check if element already exists
      let element = this.data.find(
        (element) => element.nosaukums === this.props.nosaukums
      );
      if (typeof element != "undefined") {
        this.props.setShowAlert(true);
        this.props.setAlertMessage(
          `Группа производства с названием "${this.props.nosaukums}" уже существует`
        );
        // Check if price is written correctly
      } else {
        let paramObj = {
          nosaukums: this.props.nosaukums,
          daudzums: 1,
          darbinieki: [],
        };

        // ipcRenderer.sendSync('modify',  [
        //     "add",
        //     [JSON.stringify(productObj), "ražošanas_grupas"],
        //     [0,1],
        //     sourceFileName,
        //     JSON.stringify(paramObj)
        // ]);

        let tempData = JSON.parse(ipcRenderer.sendSync("get-data"));

        lodash
          .chain(tempData)
          .get(this.props.type)
          .find({ nosaukums: this.props.productName })
          .get("ražošanas_grupas")
          .push(paramObj)
          .value();
        ipcRenderer.sendSync("modify-data", [JSON.stringify(tempData)]);
      }
    }
  }

  render() {
    return (
      <Form>
        <Form.Group className="mb-3" controlId="formGroupName">
          <Form.Label>Название</Form.Label>
          <Form.Control
            placeholder="Название"
            value={this.props.nosaukums}
            onChange={this.props.handleNameChange}
          />
        </Form.Group>
        <Button variant="primary" type="submit" onClick={this.handleSubmit}>
          Подтвердить
        </Button>
      </Form>
    );
  }
}

export default RazGrupasAddPage;
