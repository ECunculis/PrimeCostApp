import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import Form from 'react-bootstrap/Form';

import GeneralizedTable from '../GeneralizedTable';
import globalSettings from '../globalSettings';
import NavBar from "../NavBar/NavBar"

import '../App.css';

const { ipcRenderer } = window.require("electron");
const lodash = require('lodash');

function AlcoholTax() {
	let headerNames = ["Название", "Значение"]

	return (
	<>
		<NavBar/>
        <h3 className="text-center">Акциз</h3>
		<GeneralizedTable 
			headerNames={headerNames}
			tableBody={<ElectricityTableBody/>}
		/>
	</>
	);
}


function productUpdate(value) {
    let tempData = JSON.parse(ipcRenderer.sendSync('get-data'));
    // Price per each product must be updated for each product
    // that contains tax for the alcohol
    let productObjects = lodash
        .chain(tempData)
        .get("produkti")
        .value()

    productObjects.forEach(product => {
        let obj = product["alcohol_tax"]
        if (obj != null) {
            obj["value"] = value
            obj["summa"] = ((obj["value"] * obj["alcohol"]) / 100) * obj["volume"];
        }
    })

    // Update data
    ipcRenderer.sendSync('modify-data', [ JSON.stringify(tempData) ])
}



function ElectricityTableBody(props) {
    // Get electricity data from main process
	let data = JSON.parse(ipcRenderer.sendSync('get-data'));

    const [alcoholTax, setAlcoholTax] = useState(parseFloat(data["alcohol_tax"]));
	const [alcoholTaxValidated, setAlcoholTaxValidated] = useState(false);

    function alcoholTaxHandleChange(event) {
        setAlcoholTax(event.target.value)
    }


    function alcoholTaxValidation(event) {
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
            setAlcoholTaxValidated(true);
        } else {
            setAlcoholTaxValidated(false);
			// We need to calculate the cost of electricity for one product
            // i.e. recalculate the total price (total electricity * cena)
            // And then price per each product (total price / products created)
            data["alcohol_tax"] = parseFloat(alcoholTax)

            ipcRenderer.sendSync('modify-data', [ JSON.stringify(data) ])

            productUpdate(data["alcohol_tax"])
        }
    }

    return (
        <> 
            <tbody>
                <tr className="align-middle">
                    <td className="col-md-3 text-end" >Акциз (за 1 градус на 100л):</td>
                    <td>
                    <Form noValidate validated={alcoholTaxValidated}>
                        <Form.Group>
                            <Form.Control type="number" required 
                                placeholder="Акциз (за 1 градус на 100л)" 
                                value={alcoholTax} 
                                onChange={alcoholTaxHandleChange}
                                onBlur={alcoholTaxValidation}
                                style={{ width: '200px', height: '30px' }}
                            />
                            <Form.Control.Feedback type="invalid">
                                Введите акциз
                            </Form.Control.Feedback>
                        </Form.Group>  
                    </Form>
                    </td>
                </tr>
            </tbody>
        </>
    )
}




export default AlcoholTax;