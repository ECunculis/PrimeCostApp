import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Form from 'react-bootstrap/Form';

import '../App.css';

import globalSettings from '../globalSettings';

import GeneralizedTable from '../GeneralizedTable';

const { ipcRenderer } = window.require("electron");
const lodash = require('lodash');


function AlcoholTaxBlock(props) {

    let headerNames = ["Название", "Значение"]

    let data = JSON.parse(ipcRenderer.sendSync('get-data'));

    let productObj = lodash
        .chain(data)
        .get(props.type)
        .find({nosaukums: props.nosaukums})
        .value()

    let obj = productObj["alcohol_tax"]

    if (obj == null) {
        return null;
    } else {
        return (
            <> 
                <h3 className="text-center">Акциз</h3>
                <GeneralizedTable 
                    headerNames={headerNames}
                    tableBody=
                    {<DepositTableBody 
                        {...props}
                    />}
                />
            </>
        )
    }
}

function DepositTableBody(props) {
    let data = JSON.parse(ipcRenderer.sendSync('get-data'));

    let productObj = lodash
        .chain(data)
        .get(props.type)
        .find({nosaukums: props.nosaukums})
        .value()

    let obj = productObj["alcohol_tax"]

    const [alcohol, setAlcohol] = useState(obj["alcohol"]);
    const [alcoholValidated, setAlcoholValidated] = useState(false);

    const [volume, setVolume] = useState(obj["volume"]);
    const [volumeValidated, setVolumeValidated] = useState(false);

    function volumeHandleChange(event) {
        setVolume(event.target.value)
    };

    function alcoholHandleChange(event) {
        setAlcohol(event.target.value)
    };

    function volumeHandleValidation(event) {
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
            setVolumeValidated(true);
        } else {
            setVolumeValidated(false);
            // Update the value
            obj["volume"] = parseFloat(volume)
            obj["summa"] = ((obj["value"] * obj["alcohol"]) / 100) * obj["volume"];

            ipcRenderer.sendSync('modify-data', [ JSON.stringify(data) ])
        }
    };

    function alcoholHandleValidation(event) {
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
            setAlcoholValidated(true);
        } else {
            setAlcoholValidated(false);
            // Update the value
            obj["alcohol"] = parseFloat(alcohol)
            obj["summa"] = ((obj["value"] * obj["alcohol"]) / 100) * obj["volume"];

            ipcRenderer.sendSync('modify-data', [ JSON.stringify(data) ])
        }
    };


    return (
        <> 
            <tbody>
                <tr className="align-middle">
                    <td className="col-md-3 text-end">Акциз (за 1 градус на 100л):</td>
                    <td>{obj["value"].toFixed(globalSettings["floatPrecisionSecondary"])}</td>
                </tr>
                <tr className="align-middle">
                    <td className="text-end">Градусность (%):</td>
                    <td>
                        <Form noValidate validated={alcoholValidated}>
                            <Form.Group>
                                <Form.Control type="number" required 
                                    placeholder="Кол-во" 
                                    value={alcohol} 
                                    onChange={alcoholHandleChange}
                                    onBlur={alcoholHandleValidation}
                                    style={{ width: '120px', height: '30px' }}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Введите количество
                                </Form.Control.Feedback>
                            </Form.Group>  
                        </Form>    
                    </td>
                </tr>
                <tr className="align-middle">
                    <td className="text-end">Обьём (Л):</td>
                    <td>
                        <Form noValidate validated={volumeValidated}>
                            <Form.Group>
                                <Form.Control type="number" required 
                                    placeholder="Кол-во" 
                                    value={volume} 
                                    onChange={volumeHandleChange}
                                    onBlur={volumeHandleValidation}
                                    style={{ width: '120px', height: '30px' }}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Введите количество
                                </Form.Control.Feedback>
                            </Form.Group>  
                        </Form>    
                    </td>
                </tr>
                <tr className="align-middle">
                    <td className="col-md-3 text-end">Сумма:</td>
                    <td>{obj["summa"].toFixed(globalSettings["floatPrecisionSecondary"])}</td>
                </tr>
            </tbody>
        </>
    )
}


export default AlcoholTaxBlock;