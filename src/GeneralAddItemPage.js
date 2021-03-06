import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';

const { ipcRenderer } = window.require("electron");

class GeneralAddItemPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nosaukums: '',
            cena: '',
            showAlert: false,
            alertMessage: ""
        };

        this.data = {};
  
        this.handleNameChange = this.handleNameChange.bind(this);
        this.handlePriceChange = this.handlePriceChange.bind(this);

        this.setShowAlert = this.setShowAlert.bind(this);
        this.setAlertMessage = this.setAlertMessage.bind(this);

    }
  
    handleNameChange(event) {
        this.setState({nosaukums: event.target.value});
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
                nosaukums={this.state.nosaukums}
                cena={this.state.cena}

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
		this.data = ipcRenderer.sendSync('raw-material-all:get');
		this.data = JSON.parse(this.data)

        // Check if empty
        if (this.props.nosaukums === "" || this.props.cena === "") {
            this.props.setShowAlert(true)
            this.props.setAlertMessage("?????????????? ????????????")
        } else {
            // Check if element already exists
            let element = this.data.find(element => element.nosaukums === this.props.nosaukums);
            if (typeof(element) != "undefined") {
                this.props.setShowAlert(true)
                this.props.setAlertMessage(`?????????? ?? ?????????????????? "${this.props.nosaukums}" ?????? ????????????????????`);
            // Check if price is written correctly
            } else if (!isNumeric(this.props.cena)) {
                this.props.setShowAlert(true)
                this.props.setAlertMessage(`???????? ?????????????? ?? ???????????????????????? ??????????????`);
            } else {
                let paramObj = [
                    { "nosaukums": this.props.nosaukums, "cena": parseFloat(this.props.cena)},
                    "nosaukums"
                ]
                // Send the values to main process
                // ipcRenderer.send('raw-material:add', [paramObj]);

                let temp = ipcRenderer.sendSync('modify',  [
                    "add", 
                    [], 
                    [], 
                    '/../data/raw-material-all.json', 
                    JSON.stringify(paramObj)
                ]);
            }
        } 
    }

    render() {
        return (
            <Form>
                <Form.Group className="mb-3" controlId="formGroupName">
                    <Form.Label>???????????????? ??????????</Form.Label>
                    <Form.Control placeholder="????????????????" value={this.props.nosaukums} onChange={this.props.handleNameChange}  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formGroupPrice">
                    <Form.Label>???????? ???? ??????????????????</Form.Label>
                    <Form.Control placeholder="????????" value={this.props.cena} onChange={this.props.handlePriceChange} />
                </Form.Group>
                <Button variant="primary" type="submit" onClick={this.handleSubmit}>
                    ??????????????????????
                </Button>
            </Form>
        )
    }
}


export default GeneralAddItemPage;