import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';

import {
	BrowserRouter as Link,
    useParams,
} from "react-router-dom";

const { ipcRenderer } = window.require("electron");

function AddRawMaterialToProductPage() {
	let { productName } = useParams();

	// Get raw material data from main process
    let data = ipcRenderer.sendSync('get', [
		[],
		[],
		"/../data/raw-material-all.json"
	]);
	data = JSON.parse(data)

	return(
		<AddToProductPageClass productName={productName} data={data}/>
	)
}

class AddToProductPageClass extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showAlert: false,
            alertMessage: ""
        };

		this.productName = props.productName
		this.data = props.data

		this.setShowAlert = this.setShowAlert.bind(this);
		this.setAlertMessage = this.setAlertMessage.bind(this);
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
				<AddAlert 
                    showAlert={this.state.showAlert} 
                    alertMessage={this.state.alertMessage} 
                    onClose={() => this.setShowAlert(false)}
                />
				<IzejvielasTable 
                    productName={this.productName}
                    setShowAlert={this.setShowAlert}
                    setAlertMessage={this.setAlertMessage}
                />
			</>
		)
	}

}


function AddAlert(props) {

    if (props.showAlert) {
        return (
            <Alert variant="danger" onClose={props.onClose} dismissible>
                {props.alertMessage}
            </Alert>
        );
      }
    return (null)
}


function IzejvielasTable(props) {
    // Get raw material data from main process
    let data = ipcRenderer.sendSync('get', [
        [],
        [],
        "/../data/raw-material-all.json"
    ]);
    let izejvielas = JSON.parse(data)

    return (
        <>
            <h2>Izejvielas</h2>
            <Table striped bordered hover size="sm">
                <thead>
                <tr>
                    <th>Izejviela</th>
                    <th>Cena</th>
					<th>Добавить</th>
                </tr>
                </thead>
                <tbody>
                    <Izejvielas 
                        izejvielasList={izejvielas} 
                        productName={props.productName}

                        setShowAlert={props.setShowAlert}
                        setAlertMessage={props.setAlertMessage}
                    />
                </tbody>
            </Table>
        </>
    )
}


function Izejvielas(props) {
    let itemList = props.izejvielasList
    let componentList = [];
    // Make the list of components
    itemList.forEach((item) => {
        componentList.push(<IzejvielaEntry 
                                key={item.nosaukums} 
                                item={item} 
                                productName={props.productName}
                                setShowAlert={props.setShowAlert}
                                setAlertMessage={props.setAlertMessage}
                            />)
    })
    return componentList;
}


function IzejvielaEntry(props) {
    return (
        <tr>
            <td>{props.item.nosaukums}</td>
            <td>{props.item.cena}</td>
			<td>
				<AddRawButton 
                    nosaukums={props.item.nosaukums} 
                    cena={props.item.cena}
                    productName={props.productName}
                    setShowAlert={props.setShowAlert}
                    setAlertMessage={props.setAlertMessage}
                />
			</td>
        </tr>
    )
}

function AddRawButton(props) {
	function handleClick() {
		let nosaukums = props.nosaukums;
        let cena = props.cena;
		let productName = props.productName;
        let data = "";

        let izejvielaObjAdd = [
            { "nosaukums": nosaukums, "cena": cena, "daudzums": 1, "kopuma": cena },
            "nosaukums"
        ]
        // data = ipcRenderer.sendSync('product-raw-material:add-general', [izejvielaObj, productName]);
        // Get the index
        let productObj = { key: "nosaukums", value: productName }
        data = ipcRenderer.sendSync('modify',  [
            "add", 
            [JSON.stringify(productObj), "izejvielas"], 
            [0,1], 
            '/../data/products-all.json', 
            JSON.stringify(izejvielaObjAdd)]);

		if (data === "Already in the list") {
            props.setAlertMessage('Сырье "' + nosaukums + '" уже в списке')
            props.setShowAlert(true)
		} 
	}

	return (
		<Button variant="success" type="button" onClick={handleClick}>
			Добавить
		</Button>
	)
}

export default AddRawMaterialToProductPage