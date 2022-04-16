import 'bootstrap/dist/css/bootstrap.min.css';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import  { useState } from 'react';

function FileСhoice(props) {

    const [ filePath, setFilePath] = useState(null);

    function filePathHandleChange(event) {
        setFilePath(event.target.value)
    };

    function handleClick() {
        console.log("clicked!!!");
        console.log(filePath);
    }

    return (
        <>
        <Form>
            <Form.Group controlId="formFile" className="mb-3">
                <Form.Label>Default file input example</Form.Label>
                <Form.Control type="file" onChange={filePathHandleChange}/>
            </Form.Group>

            <Button variant="success" type="button" size="sm" onClick={handleClick}>
                Подтвердить
            </Button>
        </Form>
        </>
    )
}


export default FileСhoice;