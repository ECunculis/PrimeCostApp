import React from 'react';
import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import globalSettings from "./../globalSettings"

import {
    useHistory
} from "react-router-dom";

const { ipcRenderer } = window.require("electron");
const lodash = require('lodash');

function NavBar() {
    let history = useHistory();

    function handleClick(path, e) {
        // Only push to the location which is different from the current one
        if (path !== history.location.pathname) {
            history.push(path);
        }
    }

    function goBack() {
        history.goBack();
    }

    function primeCalculate() {
        // Get all data
        let data = JSON.parse(ipcRenderer.sendSync('get-data'));
        
        // Get all products
        let productObjects = lodash
            .chain(data)
            .get("produkti")
            .value()

        let izejvielasAll = data["izejvielas"]
        let pudeles = []

        // Calculate for bottles first
        productObjects.forEach(product => {
            if (product["grupa"] === "Bottles") {
                let izejvielas = product["izejvielas"]
                let fiksetie = product["fiksētie"]
                let udens_sagatavosana = product["udens_sagatavosana"]
                let iepakojums = product["iepakojums"]["elementi"]
                let razosanas_grupas = product["ražošanas_grupas"]
                let elektriba = product["elektriba"]
                let deposit = product["deposit"]

                let summa = 0
                let iepakSumma = 0

                // Calculate for izejvielas
                izejvielas.forEach(item => {
                    summa += item["kopuma"]
                })
                // Calculate for udens_sagatavosana
                udens_sagatavosana.forEach(item => {
                    summa += item["cena"]
                })
                // Calculate for iepakojums
                iepakojums.forEach(item => {
                    summa += item["summa_vien"]
                    iepakSumma += item["summa_vien"]
                })
                // Calculate for salary
                razosanas_grupas.forEach(razGrupa => {
                    razGrupa["darbinieki"].forEach(item => {
                        summa += item["summa_vien"]
                    })
                })
                // Calculate for elektriba
                summa += elektriba["summa"]
                // Calculate for fiksetie
                summa += fiksetie["summa"]
                // Calculate for deposit
                summa += deposit

                let summa_without_package = summa - deposit - iepakSumma

                // Update the pudele's prime price
                product["cena"] = summa.toFixed(globalSettings["floatPrecisionThird"])
                product["cena(bez iepak.)"] = summa_without_package.toFixed(globalSettings["floatPrecisionThird"])

                //  If the product is bottle, put into the list
                pudeles.push(product)
            }
        })

        // Update the list of bottles in the raw material list
        productObjects.forEach(product => {
            if (product["grupa"] === "Bottles") {
                let pudele_izejviela = lodash
                    .chain(izejvielasAll)
                    .find({nosaukums : product.nosaukums})
                    .value()

                if (pudele_izejviela === undefined) {
                    // Create the entry if not in the list
                    let objAdd = {
                        "kods": "pudele",
                        "nosaukums": product.nosaukums,
                        "mervieniba": "gab",
                        "cena": product["cena(bez iepak.)"]
                    }

                    izejvielasAll.push(objAdd) // Add new object 
                } else {
                    // Just change the price if already in the list
                    pudele_izejviela["cena"] = product["cena(bez iepak.)"]
                }

                // Update the values in each product and group
                productObjects.forEach(item => {
                    // Get object
                    let izejvielasObj = lodash
                            .chain(item)
                            .get("izejvielas")
                            .find({nosaukums: product.nosaukums})
                            .value()
                    // If object exists
                    if (izejvielasObj !== undefined) {
                        let newKopuma = product["cena(bez iepak.)"] * izejvielasObj["daudzums"]

                        lodash
                            .chain(izejvielasObj)
                            .assign({"cena" : product["cena(bez iepak.)"]})
                            .assign({"kopuma" : parseFloat(newKopuma)})
                            .value()
                    }

                })
        
            }
        })
        
        // Update the prime price again, using updated bottle prices
        productObjects.forEach(product => {
            let izejvielas = product["izejvielas"]
            let fiksetie = product["fiksētie"]
            let udens_sagatavosana = product["udens_sagatavosana"]
            let iepakojums = product["iepakojums"]["elementi"]
            let razosanas_grupas = product["ražošanas_grupas"]
            let elektriba = product["elektriba"]
            let deposit = product["deposit"]
            let alcohol_tax = product["alcohol_tax"]

            let summa = 0

            // Calculate for izejvielas
            izejvielas.forEach(item => {
                summa += item["kopuma"]
            })

            // Calculate for udens_sagatavosana
            udens_sagatavosana.forEach(item => {
                summa += item["cena"]
            })
            // Calculate for iepakojums
            iepakojums.forEach(item => {
                summa += item["summa_vien"]
            })
            // Calculate for iepakojums
            razosanas_grupas.forEach(razGrupa => {
                razGrupa["darbinieki"].forEach(item => {
                    summa += item["summa_vien"]
                })
            })

            // Calculate for elektriba
            summa += elektriba["summa"]
            // Calculate for fiksetie
            summa += fiksetie["summa"]
            // Calculate for deposit
            summa += deposit
            // Calculate for alcohol tax
            if (alcohol_tax != null) summa += alcohol_tax["summa"]

            // Update the product's prime price
            product["cena"] = summa
        })

        // Update the database
        ipcRenderer.sendSync('modify-data', [ JSON.stringify(data) ])
    }

    return (
        <Navbar bg="dark" variant="dark" sticky="top">
            <Container>
                <Navbar.Brand onClick={() => handleClick("/")}>Main page</Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />

                    <Nav className="me-auto">
                        <NavDropdown
                            id="nav-dropdown-dark-example"
                            title="General"
                            menuVariant="dark" 
                            >
                            <NavDropdown.Item onClick={() => handleClick("/raw-material-all")}>Raw Material</NavDropdown.Item>
                            <NavDropdown.Item onClick={() => handleClick("/package-all")}>Package</NavDropdown.Item>
                            <NavDropdown.Item onClick={() => handleClick("/workers-all")}>Workers list</NavDropdown.Item>
                            <NavDropdown.Item onClick={() => handleClick("/electricity")}>Electricity price</NavDropdown.Item>
                            <NavDropdown.Item onClick={() => handleClick("/fixed-cost-all")}>Fixed costs</NavDropdown.Item>
                            <NavDropdown.Item onClick={() => handleClick("/alcohol-tax")}>Excise tax</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                    <Nav>
                        <Nav.Link onClick={() => goBack()}>go back</Nav.Link>
                    </Nav>

                    <Button variant="outline-success" onClick={primeCalculate}>Calculate prime price</Button>
            </Container>
        </Navbar>
    )
  }

  export default NavBar;