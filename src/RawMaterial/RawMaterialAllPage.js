import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import Button from 'react-bootstrap/Button';

import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import BootstrapTable from 'react-bootstrap-table-next';
import cellEditFactory from 'react-bootstrap-table2-editor';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';

import AddNewItemButton from '../AddNewItemButton';
import NavBar from "../NavBar/NavBar"
import globalSettings from '../globalSettings';
import '../App.css';


const { ipcRenderer } = window.require("electron");
const lodash = require('lodash');

function RawMaterialAllPage() {
	// let headerNames = ["Kods", "Nosaukums", "Mērvienība", "Cena", "Убрать"]

	return (
	<>
		<NavBar/>
		<h3 className="text-center">Сырьё</h3>
		<AddNewItemButton message={"raw-material:ask-for-window"}/>
		{/* <RawMaterialTable/> */}
		{/* <GeneralizedTable 
			headerNames={headerNames}
			tableBody={<TableBody/>}
		/> */}
		<NewTable />
	</>
	);
}

function buttonFormatter(cell, row, rowIndex) {
	return (
		<DeleteRawButton nosaukums={row.nosaukums} />
	);
}

const cellEdit = cellEditFactory({
  mode: 'dbclick',
  blurToSave: true,
  afterSaveCell: cenaUpdate
});


function NewTable(props) {
	// Get raw material data from main process
	let data = JSON.parse(ipcRenderer.sendSync('get-data'));
	data = lodash
		.chain(data)
		.get("izejvielas")
		.value()

	const { SearchBar } = Search;

	const columns = [{
		dataField: 'kods',
		text: 'Kods',
		editable: false,
		sort: true,
		headerAlign: 'center',
		headerStyle:  { width: "80px"}
		}, {
		dataField: 'nosaukums',
		text: 'Nosaukums',
		sort: true,
		headerAlign: 'center',
		editable: false
		}, {
		dataField: 'mervieniba',
		text: 'Mērvieniba',
		headerAlign: 'center',
		headerStyle:  { width: "12%" },
		editable: false
		}, {
		dataField: 'cena',
		text: 'Cena',
		sort: true,
		headerAlign: 'center',
		headerStyle:  { width: "200px" },
		validator: (newValue, row, column) => {
			if (isNaN(newValue)) {
			  return {
				valid: false,
				message: 'Введите число'
			  };
			}
			return true;
		  }
		}, {
		dataField: '',
		text: 'Убрать',
		headerAlign: 'center',
		headerStyle:  { width: "80px" },
		editable: false,
		formatter: buttonFormatter
	}];

	return (
		<ToolkitProvider
			keyField='nosaukums' data={ data } columns={ columns } 
			search
		>

		{
			props => (
			<div>
				<h5>Поиск по названию:</h5>
				<SearchBar 
					{ ...props.searchProps } 
					className="custom-search-field"
					// style={ { color: 'white' } }
					// delay={ 500 }
					placeholder="Найти"
					srText=""
				/>
				<hr />
				<BootstrapTable
					{ ...props.baseProps }
					bootstrap4
					striped
					hover
					condensed
					cellEdit={ cellEdit }
				/>
			</div>
			)
		}
		</ToolkitProvider>

	)
}

// function TableBody(props) {
//     // Get raw material data from main process
// 	let data = JSON.parse(ipcRenderer.sendSync('get-data'));
// 	data = lodash
// 		.chain(data)
// 		.get("izejvielas")
// 		.value()
		
//     // Create the list
//     let itemList = [];

//     data.forEach(item => {
//         itemList.push(
//             <tr key={item.nosaukums.toString()} >
// 				<td>{item.kods}</td>
//                 <td>{item.nosaukums}</td>
// 				<td>{item.mervieniba}</td>
//                 <td><Cena item={item}/></td>
//                 <td>
//                     <DeleteRawButton nosaukums={item.nosaukums} />
//                 </td>
//             </tr>
//         );
//     });

//     return(
// 		<>
//         <tbody>
//             {itemList}
//         </tbody> 
// 		</>
//     )
// }

function cenaUpdate(oldValue, newValue, row, column) {
	let newCena = newValue

	let data = JSON.parse(ipcRenderer.sendSync('get-data'));
	lodash
		.chain(data)
		.get("izejvielas")
		.find({nosaukums: row.nosaukums})
		.assign({"cena" : parseFloat(newCena)})
		.value()
	

	// We need to update the value everythere i.e. in all groups and all products
	// which have this specific expense in the list

	// Get all products
	let productObjects = lodash
		.chain(data)
		.get("produkti")
		.value()

	// Get all grupas
	let groupObjects = lodash
		.chain(data)
		.get("grupas")
		.value()

	productObjects.forEach(product => {
		// Get object
		let izejvielasObj = lodash
				.chain(product)
				.get("izejvielas")
				.find({nosaukums: row.nosaukums})
				.value()
		// If object exists
		if (izejvielasObj !== undefined) {

			let newKopuma = newCena * izejvielasObj["daudzums"]

			lodash
				.chain(izejvielasObj)
				.assign({"cena" : parseFloat(newCena)})
				.assign({"kopuma" : parseFloat(newKopuma)})
				.value()
		}

	})

	groupObjects.forEach(group => {
		let izejvielasObj = lodash
			.chain(group)
			.get("izejvielas")
			.find({nosaukums: row.nosaukums})
			.value()

		if (izejvielasObj !== undefined) {
			let newKopuma = newCena * izejvielasObj["daudzums"]

			lodash
				.chain(izejvielasObj)
				.assign({"cena" : parseFloat(newCena)})
				.assign({"kopuma" : parseFloat(newKopuma)})
				.value()

		}
	})

	// Update data
	ipcRenderer.sendSync('modify-data', [ JSON.stringify(data), false ])
}

// function Cena(props) {
// 	const [cena, setCena] = useState(parseFloat(props.item.cena));
// 	const [validated, setValidated] = useState(false);

// 	function handleChange(event) {
//         setCena(event.target.value)
//     }
// 	function handleValidation(event) {
//         const form = event.currentTarget;
//         if (form.checkValidity() === false) {
//             event.preventDefault();
//             event.stopPropagation();
//             setValidated(true);
//         } else {
//             setValidated(false);
//             // Update the value

// 			let data = JSON.parse(ipcRenderer.sendSync('get-data'));
//             lodash
//                 .chain(data)
//                 .get("izejvielas")
//                 .find({nosaukums: props.item.nosaukums})
//                 .assign({"cena" : parseFloat(cena)})
//                 .value()
            

// 			// We need to update the value everythere i.e. in all groups and all products
// 			// which have this specific expense in the list

// 			// Get all products
// 			let productObjects = lodash
// 				.chain(data)
// 				.get("produkti")
// 				.value()

// 			// Get all grupas
// 			let groupObjects = lodash
// 				.chain(data)
// 				.get("grupas")
// 				.value()

// 			productObjects.forEach(product => {
// 				// Get object
// 				let izejvielasObj = lodash
// 						.chain(product)
// 						.get("izejvielas")
// 						.find({nosaukums: props.item.nosaukums})
// 						.value()
// 				// If object exists
// 				if (izejvielasObj !== undefined) {

// 					let newKopuma = cena * izejvielasObj["daudzums"]

// 					lodash
// 						.chain(izejvielasObj)
// 						.assign({"cena" : parseFloat(cena)})
// 						.assign({"kopuma" : parseFloat(newKopuma)})
// 						.value()
// 				}

// 			})

// 			groupObjects.forEach(group => {
// 				let izejvielasObj = lodash
// 					.chain(group)
// 					.get("izejvielas")
// 					.find({nosaukums: props.item.nosaukums})
// 					.value()

// 				if (izejvielasObj !== undefined) {
// 					let newKopuma = cena * izejvielasObj["daudzums"]

// 					lodash
// 						.chain(izejvielasObj)
// 						.assign({"cena" : parseFloat(cena)})
// 						.assign({"kopuma" : parseFloat(newKopuma)})
// 						.value()

// 				}
// 			})

// 			// Update data
// 			ipcRenderer.sendSync('modify-data', [ JSON.stringify(data), false])

//         }
//     }
// 	return (
// 		<Form noValidate validated={validated}>
// 			<Form.Group>
// 				<Form.Control type="number" required 
// 					placeholder="Цена" 
// 					value={cena} 
// 					onChange={handleChange}
// 					onBlur={handleValidation}
// 				/>
// 				<Form.Control.Feedback type="invalid">
// 					Введите цену
// 				</Form.Control.Feedback>
// 			</Form.Group>  
// 		</Form>
// 	)
// }

// function NavigationBar() {

// 	let history = useHistory();

// 	function handleClickMainPage() {
// 		history.push("/");
// 	}
//   return (
// 	<>
// 		<Navbar bg="dark" variant="dark">
// 			<Container>
// 			<Navbar.Brand onClick={handleClickMainPage}>На главную</Navbar.Brand>
// 				<Nav className="me-auto">
// 				</Nav>
// 			</Container>
// 		</Navbar>    
// 	</>
//   )
// }

function DeleteRawButton(props) {
	function handleClick() {
		let data = JSON.parse(ipcRenderer.sendSync('get-data'));
		
		ipcRenderer.send("warning-delete")
		ipcRenderer.on('confirm-delete', (event, arg) => {
			lodash
				.chain(data)
				.get("izejvielas")
				.remove({nosaukums: props.nosaukums})
				.value()
			ipcRenderer.sendSync('modify-data', [ JSON.stringify(data) ])
		})
		
	}
	return (
		<Button variant="danger" size="sm" onClick={handleClick}>удалить</Button>
	)
}

export default RawMaterialAllPage;