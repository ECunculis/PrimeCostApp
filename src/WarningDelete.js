import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

// import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
// import Alert from 'react-bootstrap/Alert';

const { ipcRenderer } = window.require("electron");
// const lodash = require('lodash');


function WarningDelete(props) {

    function handleDelete() {
		ipcRenderer.send("confirm-delete")
	}

    function handleCancel() {
		ipcRenderer.send("cancel-delete")
	}

    return (
        <>
        <h1>Удаление элемента</h1>
        <h3>Вы точно хотите удалить данный элемент?</h3>
        <Button variant="secondary" size="sm" onClick={handleCancel}>отмена</Button>
        <Button variant="danger" size="sm" onClick={handleDelete}>удалить</Button>
        </ >
    )
}


export default WarningDelete;