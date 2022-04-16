import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

import "./App.css";

import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";

import GeneralizedTable from "./GeneralizedTable";

import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import BootstrapTable from "react-bootstrap-table-next";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import globalSettings from "./globalSettings";

import { useParams } from "react-router-dom";

const { ipcRenderer } = window.require("electron");
const lodash = require("lodash");

let info = "";
let destinationEntryName = "";

function AddExpensesPage() {
  let { destinationEntryNameTemp, infoTemp } = useParams();

  destinationEntryName = destinationEntryNameTemp;
  info = JSON.parse(infoTemp);

  let expenses = "";
  let headerNames = "";

  switch (info["from"]) {
    case "izejvielas":
      headerNames = ["Kods", "Nosaukums", "Mērvienība", "Cena", "Добавить"];
      break;
    case "fiksētie":
      headerNames = ["Nosaukums", "Cena", "Добавить"];
      break;
    case "udens_sagatavosana":
      headerNames = ["Nosaukums", "Cena", "Добавить"];
      break;
    case "iepakojums":
      headerNames = ["Kods", "Nosaukums", "Mērvienība", "Cena", "Добавить"];
      break;
    case "darbinieki":
      headerNames = ["Nosaukums", "Alga", "Alga ar nodokļi", "Добавить"];
      break;
    case "ražošanas_grupas":
      headerNames = ["Nosaukums", "Добавить"];
      break;
    default:
      headerNames = ["Nosaukums", "Добавить"];
  }

  if (info["type"] === "all") {
    let data = JSON.parse(ipcRenderer.sendSync("get-data"));
    expenses = lodash.chain(data).get(info["from"]).value();
  } else if (info["type"] === "group") {
    let data = JSON.parse(ipcRenderer.sendSync("get-data"));
    let groupName = lodash
      .chain(data)
      .get("produkti")
      .find({ nosaukums: destinationEntryName })
      .get("grupa")
      .value();

    // Get the desired data
    if (info["from"] === "iepakojums") {
      expenses = lodash
        .chain(data)
        .get("grupas")
        .find({ nosaukums: groupName })
        .get("iepakojums")
        .get("elementi")
        .value();
    } else {
      expenses = lodash
        .chain(data)
        .get("grupas")
        .find({ nosaukums: groupName })
        .get(info["from"])
        .value();
    }
  }

  return (
    <AddExpensesPagePageClass
      destinationEntryName={destinationEntryName}
      expenses={expenses}
      headerNames={headerNames}
      info={info}
    />
  );
}

class AddExpensesPagePageClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showAlert: false,
      alertMessage: "",
    };

    this.entryName = props.entryName;
    this.expenses = props.expenses;

    this.setShowAlert = this.setShowAlert.bind(this);
    this.setAlertMessage = this.setAlertMessage.bind(this);
  }

  setShowAlert(value) {
    this.setState({ showAlert: value });
  }

  setAlertMessage(value) {
    this.setState({ alertMessage: value });
  }

  render() {
    return (
      <>
        <AddAlert
          showAlert={this.state.showAlert}
          alertMessage={this.state.alertMessage}
          onClose={() => this.setShowAlert(false)}
        />
        <ExpenseTable
          setShowAlert={this.setShowAlert}
          setAlertMessage={this.setAlertMessage}
          {...this.props}
        />
      </>
    );
  }
}

function AddAlert(props) {
  if (props.showAlert) {
    return (
      <Alert
        variant="danger"
        className="alert-fixed"
        onClose={props.onClose}
        dismissible
      >
        {props.alertMessage}
      </Alert>
    );
  }
  return null;
}

function ExpenseTable(props) {
  if (props.info["from"] === "izejvielas") {
    return (
      <>
        <TableTitle />
        <IzejvielaTable {...props} />
      </>
    );
  }

  return (
    <>
      <TableTitle />
      <GeneralizedTable
        headerNames={props.headerNames}
        tableBody={<ExpenseTableBody {...props} />}
      />
    </>
  );
}

function buttonFormatter(cell, row, rowIndex, formatExtraData) {
  console.log(formatExtraData.props);
  return (
    // <DeleteRawButton nosaukums={row.nosaukums} />
    <AddExpenseButton
      setAlertMessage={formatExtraData.props.setAlertMessage}
      setShowAlert={formatExtraData.props.setShowAlert}
      row={row}
    />
  );
}

function IzejvielaTable(props) {
  const { SearchBar } = Search;

  const columns = [
    {
      dataField: "kods",
      text: "Kods",
      editable: false,
      sort: true,
      headerAlign: "center",
      headerStyle: { width: "80px" },
    },
    {
      dataField: "nosaukums",
      text: "Nosaukums",
      sort: true,
      headerAlign: "center",
      editable: false,
    },
    {
      dataField: "mervieniba",
      text: "Mērvieniba",
      headerAlign: "center",
      headerStyle: { width: "12%" },
      editable: false,
    },
    {
      dataField: "cena",
      text: "Cena",
      sort: true,
      headerAlign: "center",
      headerStyle: { width: "200px" },
      editable: false,
    },
    {
      dataField: "",
      text: "Убрать",
      headerAlign: "center",
      headerStyle: { width: "80px" },
      editable: false,
      formatter: buttonFormatter,
      formatExtraData: {
        props: props,
      },
    },
  ];

  return (
    <ToolkitProvider
      keyField="nosaukums"
      data={props.expenses}
      columns={columns}
      search
    >
      {(props) => (
        <div>
          <h5>Поиск по названию:</h5>
          <SearchBar
            {...props.searchProps}
            className="custom-search-field"
            placeholder="Найти"
            srText=""
          />
          <hr />
          <BootstrapTable
            {...props.baseProps}
            bootstrap4
            striped
            hover
            condensed
          />
        </div>
      )}
    </ToolkitProvider>
  );
}

function TableTitle() {
  let title;
  switch (info["from"]) {
    case "izejvielas":
      title = "Сырьё";
      break;
    case "fiksētie":
      title = "Фиксированные";
      break;
    case "udens_sagatavosana":
      title = "Водоподготовка";
      break;
    case "iepakojums":
      title = "Упаковка";
      break;
    case "darbinieki":
      title = "Работники";
      break;
    case "ražošanas_grupas":
      title = "Группы производств";
      break;
    default:
      throw new Error('Unknown "from" entry');
  }

  return <h2>{title}</h2>;
}

function ExpenseTableBody(props) {
  let componentList = [];
  let component;
  switch (info["from"]) {
    case "izejvielas":
      component = <IzejvielaEntry {...props} />;
      break;
    case "fiksētie":
      component = <FixedEntry {...props} />;
      break;
    case "iepakojums":
      component = <PackageEntry {...props} />;
      break;
    case "darbinieki":
      component = <WorkersEntry {...props} />;
      break;
    case "ražošanas_grupas":
      component = <RazGrupasEntry {...props} />;
      break;
    default:
      throw new Error('Unknown "from" entry');
  }
  // Make the list of components
  props.expenses.forEach((item) => {
    componentList.push(React.cloneElement(component, { item: item }));
  });
  return <tbody>{componentList}</tbody>;
}

function IzejvielaEntry(props) {
  return (
    <tr>
      <td>{props.item.kods}</td>
      <td>{props.item.nosaukums}</td>
      <td>{props.item.mervieniba}</td>
      <td>{props.item.cena}</td>
      <td>
        <AddExpenseButton {...props} />
      </td>
    </tr>
  );
}

function FixedEntry(props) {
  return (
    <tr>
      <td>{props.item.nosaukums}</td>
      <td>{props.item.cena}</td>
      <td>
        <AddExpenseButton {...props} />
      </td>
    </tr>
  );
}

function PackageEntry(props) {
  return (
    <tr>
      <td>{props.item.kods}</td>
      <td>{props.item.nosaukums}</td>
      <td>{props.item.mervieniba}</td>
      <td>{props.item.cena}</td>
      <td>
        <AddExpenseButton {...props} />
      </td>
    </tr>
  );
}

function WorkersEntry(props) {
  return (
    <tr>
      <td>{props.item.nosaukums}</td>
      <td>{props.item.alga.toFixed(globalSettings["floatPrecisionThird"])}</td>
      <td>
        {props.item.alga_nodoklis.toFixed(
          globalSettings["floatPrecisionThird"]
        )}
      </td>
      <td>
        <AddExpenseButton {...props} />
      </td>
    </tr>
  );
}

function RazGrupasEntry(props) {
  return (
    <tr>
      <td>{props.item.nosaukums}</td>
      <td>
        <AddExpenseButton {...props} />
      </td>
    </tr>
  );
}

function AddExpenseButton(props) {
  function handleClick() {
    let ObjAdd = {};

    // Need to populate the entries with default data if
    // the data is taken from the general list
    if (info["type"] === "all") {
      switch (info["from"]) {
        case "izejvielas":
          ObjAdd = {
            kods: props.row.kods,
            nosaukums: props.row.nosaukums,
            mervieniba: props.row.mervieniba,
            cena: props.row.cena,
            daudzums: 1,
            kopuma: props.row.cena,
          };
          break;
        case "fiksētie":
          ObjAdd = { nosaukums: props.item.nosaukums, cena: props.item.cena };
          break;
        case "udens_sagatavosana":
          ObjAdd = { nosaukums: props.item.nosaukums, cena: props.item.cena };

          break;
        case "iepakojums":
          ObjAdd = {
            kods: props.item.kods,
            nosaukums: props.item.nosaukums,
            mervieniba: props.item.mervieniba,
            cena: props.item.cena,
            norma: 1,
            summa_iepak: props.item.cena,
            summa_vien: props.item.cena,
          };
          break;
        case "darbinieki":
          let data = JSON.parse(ipcRenderer.sendSync("get-data"));
          let daudzums = lodash
            .chain(data)
            .get(info["to"])
            .find({ nosaukums: destinationEntryName })
            .get("ražošanas_grupas")
            .find({ nosaukums: info["raz_grupas_nosaukums"] })
            .get("daudzums")
            .value();

          ObjAdd = {
            nosaukums: props.item.nosaukums,
            alga: props.item.alga,
            alga_nodoklis: props.item.alga_nodoklis,
            norma: 1,
            summa: props.item.alga_nodoklis,
            summa_vien: props.item.alga_nodoklis / daudzums,
          };
          break;
        default:
          throw new Error('Unknown "from" entry');
      }
    } else if (info["type"] === "group") {
      ObjAdd = props.item;
    }

    let data = addExpenseToFile(destinationEntryName);

    function addExpenseToFile(destinationEntryName) {
      let data;
      if (info["from"] === "iepakojums") {
        let data = JSON.parse(ipcRenderer.sendSync("get-data"));
        let array = lodash
          .chain(data)
          .get(info["to"])
          .find({ nosaukums: destinationEntryName })
          .get("iepakojums")
          .get("elementi");

        if (array.find({ nosaukums: ObjAdd.nosaukums }).value() === undefined) {
          // Add the object to array
          array.push(ObjAdd).value();
          ipcRenderer.sendSync("modify-data", [JSON.stringify(data)]);
        } else {
          return "Already in the list";
        }
      } else if (info["from"] === "darbinieki") {
        let data = JSON.parse(ipcRenderer.sendSync("get-data"));
        let array = lodash
          .chain(data)
          .get(info["to"])
          .find({ nosaukums: destinationEntryName })
          .get("ražošanas_grupas")
          .find({ nosaukums: info["raz_grupas_nosaukums"] })
          .get("darbinieki");

        if (array.find({ nosaukums: ObjAdd.nosaukums }).value() === undefined) {
          // Add the object to array
          array.push(ObjAdd).value();
          ipcRenderer.sendSync("modify-data", [JSON.stringify(data)]);
        } else {
          return "Already in the list";
        }
      } else {
        data = JSON.parse(ipcRenderer.sendSync("get-data"));
        let array = lodash
          .chain(data)
          .get(info["to"])
          .find({ nosaukums: destinationEntryName })
          .get(info["from"]);

        // If object is not in the list
        if (array.find({ nosaukums: ObjAdd.nosaukums }).value() === undefined) {
          // Add the object to array
          array.push(ObjAdd).value();
          ipcRenderer.sendSync("modify-data", [JSON.stringify(data)]);
        } else {
          return "Already in the list";
        }
      }
      return null;
    }

    if (data === "Already in the list") {
      let message = "";
      switch (info["from"]) {
        case "izejvielas":
          message = 'Сырье "' + props.row.nosaukums + '" уже в списке';
          break;
        case "fiksētie":
          message =
            'Фиксированная затрата "' + props.item.nosaukums + '" уже в списке';
          break;
        case "udens_sagatavosana":
          message =
            'Водоподготовка "' + props.item.nosaukums + '" уже в списке';
          break;
        case "iepakojums":
          message = 'Упаковка "' + props.item.nosaukums + '" уже в списке';
          break;
        case "darbinieki":
          message = 'Работник "' + props.item.nosaukums + '" уже в списке';
          break;
        case "ražošanas_grupas":
          message =
            'Группа производства "' + props.item.nosaukums + '" уже в списке';
          break;
        default:
          throw new Error('Unknown "from" entry');
      }
      props.setAlertMessage(message);
      props.setShowAlert(true);
    }
  }

  return (
    <Button variant="success" type="button" size="sm" onClick={handleClick}>
      Добавить
    </Button>
  );
}

export default AddExpensesPage;
