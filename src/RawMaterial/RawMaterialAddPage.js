import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';

const { ipcRenderer } = window.require("electron");
const lodash = require('lodash');

class RawMaterialAddPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            kods: '',
            nosaukums: '',
            mervieniba: '',
            cena: '',
            showAlert: false,
            alertMessage: ""
        };

        this.data = {};
  
        this.handleKodsChange = this.handleKodsChange.bind(this);
        this.handleNameChange = this.handleNameChange.bind(this);
        this.handleMervienibaChange = this.handleMervienibaChange.bind(this);
        this.handlePriceChange = this.handlePriceChange.bind(this);

        this.setShowAlert = this.setShowAlert.bind(this);
        this.setAlertMessage = this.setAlertMessage.bind(this);

    }
  
    handleKodsChange(event) {
        this.setState({kods: event.target.value});
    }
    handleNameChange(event) {
        this.setState({nosaukums: event.target.value});
    }
    handleMervienibaChange(event) {
        console.log(event.target.value)
        this.setState({mervieniba: event.target.value});
    }
    handlePriceChange(event) {
        this.setState({cena: event.target.value});
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
                kods={this.state.kods}
                nosaukums={this.state.nosaukums}
                mervieniba={this.state.mervieniba}
                cena={this.state.cena}

                handleKodsChange={this.handleKodsChange}
                handleMervienibaChange={this.handleMervienibaChange}
                handleNameChange={this.handleNameChange} 
                handlePriceChange={this.handlePriceChange} 
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

        // Check the input correctness
        // Get raw material data from main process
        this.data = JSON.parse(ipcRenderer.sendSync('get-data'));
        this.data = lodash
            .chain(this.data)
            .get("izejvielas")
            .value()

        // Check if empty
        if (this.props.nosaukums === "" || this.props.cena === "" || this.props.kods === "" || this.props.mervieniba === "") {
            this.props.setShowAlert(true)
            this.props.setAlertMessage("Введите данные")
        } else {
            // Check if kods already exists
            let element = this.data.find(element => parseInt(element.kods) === parseInt(this.props.kods));
            if (typeof(element) != "undefined") {
                this.props.setShowAlert(true)
                this.props.setAlertMessage(`Код "${this.props.kods}" уже существует`);
            } else {
                // Check if element already exists
                element = this.data.find(element => element.nosaukums === this.props.nosaukums);
                if (typeof(element) != "undefined") {
                    this.props.setShowAlert(true)
                    this.props.setAlertMessage(`Сырье с названием "${this.props.nosaukums}" уже существует`);
                // Check if price is written correctly
                } else if (!isNumeric(this.props.cena)) {
                    this.props.setShowAlert(true)
                    this.props.setAlertMessage(`Цена введена в неправильном формате`);
                } else if (!isNumeric(this.props.kods)) {
                    this.props.setShowAlert(true)
                    this.props.setAlertMessage(`Код введен в неправильном формате`);
                } else {
                    let paramObj = 
                        { 
                            "kods": parseInt(this.props.kods), 
                            "nosaukums": this.props.nosaukums, 
                            "mervieniba": this.props.mervieniba, 
                            "cena": parseFloat(this.props.cena)
                        }

                    let tempData = JSON.parse(ipcRenderer.sendSync('get-data'));
                    lodash
                        .chain(tempData)
                        .get("izejvielas")
                        .push(paramObj)
                        .value()
                    ipcRenderer.sendSync('modify-data', [ JSON.stringify(tempData) ])
                }

            }

        } 
    }

    render() {
        return (
            <Form>
                <Form.Group className="mb-3" controlId="formGroupName">
                    <Form.Label>Код Сырья</Form.Label>
                    <Form.Control placeholder="Код" value={this.props.kods} onChange={this.props.handleKodsChange}  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formGroupName">
                    <Form.Label>Название Сырья</Form.Label>
                    <Form.Control placeholder="Название" value={this.props.nosaukums} onChange={this.props.handleNameChange}  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formGroupName">
                    <Form.Label>Mērvienība</Form.Label>
                    <Form.Select aria-label="Default select example" value={this.props.mervieniba} onChange={this.props.handleMervienibaChange}>
                        <option value="">Mērvienība</option>
                        <option value="kg">kg</option>
                        <option value="gab">gab</option>
                        <option value="l">l</option>
                    </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formGroupPrice">
                    <Form.Label>Цена</Form.Label>
                    <Form.Control placeholder="Цена" value={this.props.cena} onChange={this.props.handlePriceChange} />
                </Form.Group>
                <Button variant="primary" type="submit" onClick={this.handleSubmit}>
                    Подтвердить
                </Button>
            </Form>
        )
    }
}


export default RawMaterialAddPage;