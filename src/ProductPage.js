import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

import IzejvielasBlock from "./RawMaterial/IzejvielasBlock";
import FixedCostBlock from "./FixedCost/FixedCostBlock";
import PackageBlock from "./Package/PackageBlock";
import WorkersBlock from "./Workers/WorkersBlock";
import ElectricityBlock from "./Electricity/ElectricityBlock";
import DepositBlock from "./Deposit/DepositBlock";
import NavBar from "./NavBar/NavBar";

import globalSettings from "./globalSettings";

import { useParams } from "react-router-dom";
import AlcoholTaxBlock from "./AlcoholTax/AlcoholTaxBlock";

const { ipcRenderer } = window.require("electron");
const lodash = require("lodash");

function ProductPage() {
  // We can use the `useParams` hook here to access
  // the dynamic pieces of the URL.
  let { kods } = useParams();

  let data = JSON.parse(ipcRenderer.sendSync("get-data"));
  let productObject = lodash
    .chain(data)
    .get("produkti")
    .find({ kods: parseInt(kods) })
    .value();

  return (
    <>
      {/* <NavigationBar destinationName={productObject["nosaukums"]}/> */}
      <NavBar />
      <h2>{"Product name: " + productObject["nosaukums"]}</h2>
      <h4>{"Code: " + productObject["kods"]}</h4>
      <h4>
        {"Price: " +
          parseFloat(productObject["cena"]).toFixed(
            globalSettings["floatPrecision"]
          )}
      </h4>
      <CenaBezIepak productObject={productObject} />
      <ElectricityBlock
        nosaukums={productObject["nosaukums"]}
        type={"produkti"}
      />
      <IzejvielasBlock
        nosaukums={productObject["nosaukums"]}
        type={"produkti"}
      />
      <FixedCostBlock
        nosaukums={productObject["nosaukums"]}
        type={"produkti"}
      />
      <PackageBlock nosaukums={productObject["nosaukums"]} type={"produkti"} />
      <WorkersBlock nosaukums={productObject["nosaukums"]} type={"produkti"} />
      <DepositBlock nosaukums={productObject["nosaukums"]} type={"produkti"} />
      <AlcoholTaxBlock
        nosaukums={productObject["nosaukums"]}
        type={"produkti"}
      />
    </>
  );
}

function CenaBezIepak(props) {
  let productObject = props.productObject;
  if (productObject["grupa"] === "Bottles") {
    return (
      <h4>
        {"Cena bez iepak: " +
          parseFloat(productObject["cena(bez iepak.)"]).toFixed(
            globalSettings["floatPrecision"]
          )}
      </h4>
    );
  }
  return null;
}

export default ProductPage;
