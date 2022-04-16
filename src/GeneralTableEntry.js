import React, { useState } from 'react';
// import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import {
	BrowserRouter as Link,
    useParams,
	useHistory
} from "react-router-dom";

const { ipcRenderer } = window.require("electron");


function GeneralTableEntry(props) {

    return (
        <tr>
            <td>{props.item.nosaukums}</td>
            {/* <td>{props.item.cena}</td> */}
            <td>
                <Cena item={props.item}/>
            </td>
            <td>
                <DeleteEntryButton izejvielaName={props.item.nosaukums} productName={props.productName} />
            </td>
        </tr>
    )
}

function Cena(props) {
    const [cena, setCena] = useState(parseFloat(props.item.cena));
    const [validated, setValidated] = useState(false);

    function handleValidation(event) {
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
            setValidated(true);
        } else {
            setValidated(false);
            // Update the value
            let newValue = event.target.value;
            let productObj = {key : "nosaukums", value : props.productName}
            let izejvielaObj = {key : "nosaukums", value : props.item.nosaukums}
            let cenaObj = {key : "cena", value : parseFloat(cena)}
            console.log(newValue)
            let data = ipcRenderer.sendSync('modify',  [
                "modify", 
                [JSON.stringify(productObj), "izejvielas", JSON.stringify(izejvielaObj), JSON.stringify(cenaObj)], 
                [0,1,0,1], 
                '/../data/products-all.json',
                newValue
            ]);
            
        }
    };

    function handleChange(event) {
        setCena(event.target.value)
    };

    return (
        <Form noValidate validated={validated}>
            <Form.Group>
                <Form.Control type="number" required 
                    placeholder="Цена" 
                    value={cena} 
                    onChange={handleChange}
                    onBlur={handleValidation}
                />
                <Form.Control.Feedback type="invalid">
                    Введите цену
                </Form.Control.Feedback>
            </Form.Group>  
        </Form>           
    )
}

function DeleteEntryButton(props) {
	function handleClick() {
        let productName = props.productName;
		let izejvielaName = props.izejvielaName;

        let productObj = { key: "nosaukums", value: productName }
        let izejvielaObj = { key: "nosaukums", value: izejvielaName }

        let data = ipcRenderer.sendSync('modify',  [
            "remove", 
            [JSON.stringify(productObj), "izejvielas", JSON.stringify(izejvielaObj)], 
            [0,1,0], 
            '/../data/products-all.json'
        ]);
	}
	return (
		<Button variant="danger" onClick={handleClick}>удалить</Button>
	)
}

export default GeneralTableEntry