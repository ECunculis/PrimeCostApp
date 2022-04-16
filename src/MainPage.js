import React from 'react';
// import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Table from 'react-bootstrap/Table';
import NavBar from "./NavBar/NavBar"

import globalSettings from "./globalSettings"

import {
    useHistory
} from "react-router-dom";

const { ipcRenderer } = window.require("electron");
// const lodash = require('lodash');

function MainPage() {
  return (
    <>
        <NavBar/>
        <ProductTable/>
    </>
  );
}

function ProductTable() {
    // Get raw material data from main process
    let data = JSON.parse(ipcRenderer.sendSync('get-data'));

    let groups = data["grupas"];
    let products = data["produkti"];

    let groupItems = [];
    groups.forEach((group) => {
        // Get all products of the group
        let productList = products.filter(x => x.grupa === group.nosaukums)

        groupItems.push(
            <GroupEntry groupName={group.nosaukums} productList={productList} key={group.nosaukums} />
        )
    })

    return (
        <Table striped bordered hover size="sm">
            <thead>
            <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Euro/unit</th>
            </tr>
            </thead>
            <tbody>
                {groupItems}
            </tbody>
        </Table>
    )
}

function GroupEntry(props) {
    // let history = useHistory();

    // function handleClick() {
    //     history.push("/group-" + props.groupName);
    // }

    return (
        <>
            <tr className="table-secondary">
                <td colSpan="3" /* onClick={handleClick} */ >{props.groupName}</td>
            </tr> 
            <Products productList={props.productList}/>
        </>
    )
}

function Products(props) {
    let itemList = props.productList
    let componentList = [];
    // Make the list of components
    itemList.forEach((item) => {
        componentList.push(<ProductEntry key={item.nosaukums} item={item} />)
    })
    return componentList;
}

function ProductEntry(props) {
    let history = useHistory();

    function handleClick() {
        history.push("/product-" + props.item.kods);
    }

    return (
        <tr>
            <td>{props.item.kods}</td>
            <td className="product-cell" onClick={handleClick}>{props.item.nosaukums}</td>
            <td>{parseFloat(props.item.cena).toFixed(globalSettings["floatPrecision"])}</td>
        </tr>
    )
}



export default MainPage;
