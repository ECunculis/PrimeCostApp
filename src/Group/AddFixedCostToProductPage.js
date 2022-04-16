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

// Cannot use useParams() in class, 
// that is why have to use it here 
function AddFixedCostToProductPage() {
	let { productName } = useParams();

	// Get raw material data from main process
    let data = ipcRenderer.sendSync('get', [
		[],
		[],
		"/../data/fixed-cost-all.json"
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

        this.data = props.data
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
				<FixedCostTable 
                    productName={this.productName}
                    setShowAlert={this.setShowAlert}
                    setAlertMessage={this.setAlertMessage}
                    data={this.data}
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


function FixedCostTable(props) {

    let fixedCosts = props.data

    return (
        <>
            <h2>Fiksētie</h2>
            <Table striped bordered hover size="sm">
                <thead>
                <tr>
                    <th>Фиксированный расход</th>
                    <th>Cena</th>
					<th>Добавить</th>
                </tr>
                </thead>
                <tbody>
                    <FixedCosts 
                        fixedCostList={fixedCosts} 
                        productName={props.productName}

                        setShowAlert={props.setShowAlert}
                        setAlertMessage={props.setAlertMessage}
                    />
                </tbody>
            </Table>
        </>
    )
}


function FixedCosts(props) {
    let itemList = props.fixedCostList
    let componentList = [];
    // Make the list of components
    itemList.forEach((item) => {
        componentList.push(<FixedCostEntry 
                                key={item.nosaukums} 
                                item={item} 
                                productName={props.productName}
                                setShowAlert={props.setShowAlert}
                                setAlertMessage={props.setAlertMessage}
                            />)
    })
    return componentList;
}


function FixedCostEntry(props) {
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

        let fixedCostObjAdd = [
            { "nosaukums": nosaukums, "cena": cena },
            "nosaukums"
        ]

        // Get the index
        let productObj = { key: "nosaukums", value: productName }
        data = ipcRenderer.sendSync('modify',  [
            "add", 
            [JSON.stringify(productObj), "fiksētie"], 
            [0,1], 
            '/../data/products-all.json', 
            JSON.stringify(fixedCostObjAdd)]);

		if (data === "Already in the list") {
            props.setAlertMessage('Фиксированный расход "' + nosaukums + '" уже в списке')
            props.setShowAlert(true)
		} 
	}

	return (
		<Button variant="success" type="button" onClick={handleClick}>
			Добавить
		</Button>
	)
}

export default AddFixedCostToProductPage