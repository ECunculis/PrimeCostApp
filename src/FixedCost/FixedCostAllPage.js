import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import Form from 'react-bootstrap/Form';

import GeneralizedTable from '../GeneralizedTable';
import NavBar from "../NavBar/NavBar"
import globalSettings from '../globalSettings';

import '../App.css';

const { ipcRenderer } = window.require("electron");
const lodash = require('lodash');

function FixedCostAllPage() {
	let headerNames = ["Nosaukums", "Eur"]

	return (
	<>
		<NavBar/>
		{/* <RawMaterialTable/> */}
		<h3 className="text-center">Фиксированные затраты</h3>
		<GeneralizedTable 
			headerNames={headerNames}
			tableBody={<TableBody/>}
		/>
	</>
	);
}


function TableBody() {
    // Get fixed costs data from main process
	let data = JSON.parse(ipcRenderer.sendSync('get-data'));
	let fixedGeneral = lodash
        .chain(data)
        .get("fiksētie")
        .value()

    const [daudzums, setDaudzums] = useState(fixedGeneral["vien_daudzums"]);
    const [daudzumsValidated, setDaudzumsValidated] = useState(false);

    function daudzumsHandleChange(event) {
        setDaudzums(event.target.value)
    };

    function daudzumsHandleValidation(event) {
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
            setDaudzumsValidated(true);
        } else {
            setDaudzumsValidated(false);
            // Update the value
            fixedGeneral["vien_daudzums"] = parseFloat(daudzums)
            fixedGeneral["vien_summa"] = fixedGeneral["summa"] / fixedGeneral["vien_daudzums"] 

            ipcRenderer.sendSync('modify-data', [ JSON.stringify(data) ])

            productUpdate(fixedGeneral["vien_summa"])
        }
    };

    return (
        <> 
            <tbody>
                <tr className="align-middle">
                    <td className="col-md-4 text-end">Единиц произведенно:</td>
                    <td>
                        <Form noValidate validated={daudzumsValidated}>
                            <Form.Group>
                                <Form.Control type="number" required 
                                    placeholder="Кол-во" 
                                    value={daudzums} 
                                    onChange={daudzumsHandleChange}
                                    onBlur={daudzumsHandleValidation}
                                    style={{ width: '200px', height: '30px' }}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Введите количество
                                </Form.Control.Feedback>
                            </Form.Group>  
                        </Form>    
                    </td>
                </tr>
                <Elements elementi={fixedGeneral["elementi"]}/>
                <tr className="align-middle">
                    <td className="text-end">Сумма всех фиксированных:</td>
                    <td>{fixedGeneral["summa"].toFixed(globalSettings["floatPrecisionSecondary"])}</td>
                </tr>
                <tr className="align-middle ">
                    <td className="text-end">Цена/ед:</td>
                    <td>{fixedGeneral["vien_summa"].toFixed(globalSettings["floatPrecisionSecondary"])}</td>
                </tr>
            </tbody>
        </>
    )
}

function Elements(props) {
    let elementi = props.elementi
    let list = []

    elementi.forEach((item) => {
        list.push(<Element key={item.nosaukums}  item={item}/>)
    })
    return list
}

function Element(props) {
    let item = props.item

    const [summa, setSumma] = useState(parseFloat(item["value"]));
	const [summaValidated, setSummaValidated] = useState(false);

    function summaHandleChange(event) {
        setSumma(event.target.value)
    }

    function summaHandleValidation(event) {
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
            setSummaValidated(true);
        } else {
            setSummaValidated(false);

            let data = JSON.parse(ipcRenderer.sendSync('get-data'));
            let fixedGeneral = lodash
                .chain(data)
                .get("fiksētie")
                .value()

            let fixedElement = lodash
                .chain(fixedGeneral)
                .get("elementi")
                .find({"nosaukums" : item["nosaukums"]})
                .value()

            // Update the value
            fixedElement["value"] = parseFloat(summa)

            let fixedElementi = fixedGeneral["elementi"]
            let total = parseFloat(0);

            fixedElementi.forEach(item => {
                total += item["value"]
            })

            fixedGeneral["summa"] = parseFloat(total)
            fixedGeneral["vien_summa"] = fixedGeneral["summa"] / fixedGeneral["vien_daudzums"] 

            console.log(fixedGeneral["vien_summa"])

            ipcRenderer.sendSync('modify-data', [ JSON.stringify(data) ])

            productUpdate(fixedGeneral["vien_summa"])
        }
    };

    return (
        <tr className="align-middle">
            <td className="text-end">{item["nosaukums"] + ":"}</td>
            <td>
                <Form noValidate validated={summaValidated}>
                    <Form.Group>
                        <Form.Control type="number" required 
                            placeholder="Кол-во" 
                            value={summa} 
                            onChange={summaHandleChange}
                            onBlur={summaHandleValidation}
                            style={{ width: '200px', height: '30px' }}
                        />
                        <Form.Control.Feedback type="invalid">
                            Введите количество
                        </Form.Control.Feedback>
                    </Form.Group>  
                </Form>    
            </td>
        </tr>
    )
}

function productUpdate(vien_summa) {
    let tempData = JSON.parse(ipcRenderer.sendSync('get-data'));
    // Price per each product must be updated for each product
    let productObjects = lodash
        .chain(tempData)
        .get("produkti")
        .value()

    productObjects.forEach(product => {
        let fixedObj = product["fiksētie"]
        fixedObj["vien_summa"] = vien_summa
        fixedObj["summa"] = fixedObj["vien_summa"] * fixedObj["vien_daudzums"]
    })

    // Update data
    ipcRenderer.sendSync('modify-data', [ JSON.stringify(tempData) ])
}

export default FixedCostAllPage;