import Button from 'react-bootstrap/Button';
const { ipcRenderer } = window.require("electron");

function AddNewItemDropdown(props) {

	function handleGeneral(event, type) {
        ipcRenderer.send("expenses-add-window", [ props.nosaukums, JSON.stringify(type) ]);
	}

    // let dropDownButton = ""
    // if (props.type === "produkti") {
    //     dropDownButton = 
    //         <Dropdown>
    //             <Dropdown.Toggle variant="secondary" id="dropdown-basic" size="sm">
    //                 Добавить из
    //             </Dropdown.Toggle>
    //             <Dropdown.Menu>
    //                 <Dropdown.Item onClick={e => handleGeneral(e, {to:"produkti", from:"izejvielas", type:"all"})}>Общий список</Dropdown.Item>
    //                 <Dropdown.Item onClick={e => handleGeneral(e, {to:"produkti", from:"izejvielas", type:"group"})}>Список группы</Dropdown.Item>
    //             </Dropdown.Menu>
    //         </Dropdown>
    // } else if (props.type === "grupas") {
    //     dropDownButton = <Button variant="secondary" size="sm" onClick={e => handleGeneral(e, {to:"grupas", from:"izejvielas", type:"all"})}>Добавить</Button>
    // }

	return (
        <div className="addEntryButtons"> 
            <Button variant="secondary" size="sm" onClick={e => handleGeneral(e, {to:"produkti", from:props.from, type:"all"})}>Добавить</Button>
        </div>
    )
}

export default AddNewItemDropdown;