import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';

// import globalSettings from '../globalSettings';

const { ipcRenderer } = window.require("electron");
const lodash = require('lodash');

class WorkersAddPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nosaukums: '',
            alga: '',
            showAlert: false,
            alertMessage: ""
        };

        this.data = {};

        this.handleNameChange = this.handleNameChange.bind(this);
        this.handleAlgaChange = this.handleAlgaChange.bind(this);

        this.setShowAlert = this.setShowAlert.bind(this);
        this.setAlertMessage = this.setAlertMessage.bind(this);

    }

    handleNameChange(event) {
        this.setState({nosaukums: event.target.value});
    }
    handleAlgaChange(event) {
        this.setState({alga: event.target.value});
    }

    setShowAlert(value) {
        this.setState({showAlert: value});
    }
    setAlertMessage(value) {
        this.setState({alertMessage: value});
    }
  
    
    render() {

        return (
            <>
            <InputAlert 
                showAlert={this.state.showAlert} 
                alertMessage={this.state.alertMessage} 
                onClose={() => this.setShowAlert(false)}
            />
            <InputForm 
                nosaukums={this.state.nosaukums}
                alga={this.state.alga}

                handleNameChange={this.handleNameChange} 
                handleAlgaChange={this.handleAlgaChange} 
                setShowAlert={this.setShowAlert}  
                setAlertMessage={this.setAlertMessage}   
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
    return (null)
}

function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
           !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

class InputForm extends React.Component {
    constructor(props) {
        super(props)
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault();

        this.data = JSON.parse(ipcRenderer.sendSync('get-data'));

        let nodoklis = lodash
            .chain(this.data)
            .get("darbinieku_nodoklis")
            .value()
        

        this.data = lodash
            .chain(this.data)
            .get("darbinieki")
            .value()

        // Check if empty
        if (this.props.nosaukums === "" || this.props.alga === "") {
            this.props.setShowAlert(true)
            this.props.setAlertMessage("Введите данные")
        } else {
            // Check if element already exists
            let element = this.data.find(element => element.nosaukums === this.props.nosaukums);
            if (typeof(element) != "undefined") {
                this.props.setShowAlert(true)
                this.props.setAlertMessage(`Работник с названием "${this.props.nosaukums}" уже существует`);
            // Check if price is written correctly
            } else if (!isNumeric(this.props.alga)) {
                this.props.setShowAlert(true)
                this.props.setAlertMessage(`Зарплата введена в неправильном формате`);
            } else {    
                let alga = parseFloat(this.props.alga)
                let alga_procents = (alga * nodoklis) / 100
                let alga_nodoklis = alga + alga_procents

                let paramObj = 
                    { 
                        "nosaukums": this.props.nosaukums, 
                        "alga": alga,
                        "alga_procents" : alga_procents,
                        "alga_nodoklis" : alga_nodoklis
                    }

                let tempData = JSON.parse(ipcRenderer.sendSync('get-data'));
                lodash
                    .chain(tempData)
                    .get("darbinieki")
                    .push(paramObj)
                    .value()
                ipcRenderer.sendSync('modify-data', [ JSON.stringify(tempData) ])
            }
        } 
    }

    render() {
        return (
            <Form>
                <Form.Group className="mb-3" controlId="formGroupName">
                    <Form.Label>Название</Form.Label>
                    <Form.Control placeholder="Название" value={this.props.nosaukums} onChange={this.props.handleNameChange}  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formGroupPrice">
                    <Form.Label>Ставка</Form.Label>
                    <Form.Control placeholder="Цена" value={this.props.alga} onChange={this.props.handleAlgaChange} />
                </Form.Group>
                <Button variant="primary" type="submit" onClick={this.handleSubmit}>
                    Подтвердить
                </Button>
            </Form>
        )
    }
}


export default WorkersAddPage;