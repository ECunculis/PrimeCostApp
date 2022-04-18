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

class InputForm extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();

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
      this.props.setAlertMessage("Enter the data");
    } else {
      // Check if element already exists
      let element = this.data.find(
        (element) => element.nosaukums === this.props.nosaukums
      );
      if (typeof element != "undefined") {
        this.props.setShowAlert(true);
        this.props.setAlertMessage(
          `Manufacturing group "${this.props.nosaukums}" already exists`
        );
        // Check if price is written correctly
      } else {
        let paramObj = {
          nosaukums: this.props.nosaukums,
          daudzums: 1,
          darbinieki: [],
        };

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
          <Form.Label>Title</Form.Label>
          <Form.Control
            placeholder="e.g. main production line"
            value={this.props.nosaukums}
            onChange={this.props.handleNameChange}
          />
        </Form.Group>
        <Button variant="primary" type="submit" onClick={this.handleSubmit}>
          Submit
        </Button>
      </Form>
    );
  }
}

export default RazGrupasAddPage;
