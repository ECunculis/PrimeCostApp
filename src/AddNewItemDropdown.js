import Button from "react-bootstrap/Button";
const { ipcRenderer } = window.require("electron");

function AddNewItemDropdown(props) {
  function handleGeneral(event, type) {
    ipcRenderer.send("expenses-add-window", [
      props.nosaukums,
      JSON.stringify(type),
    ]);
  }

  return (
    <div className="addEntryButtons">
      <Button
        variant="secondary"
        size="sm"
        onClick={(e) =>
          handleGeneral(e, { to: "produkti", from: props.from, type: "all" })
        }
      >
        Add new item
      </Button>
    </div>
  );
}

export default AddNewItemDropdown;
