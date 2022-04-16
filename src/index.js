import React from "react";
import ReactDOM from "react-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import reportWebVitals from "./reportWebVitals";
// import './index.css';

import MainPage from "./MainPage";
import ProductPage from "./ProductPage";
import GroupPage from "./GroupPage";

import RawMaterialAllPage from "./RawMaterial/RawMaterialAllPage";
import RawMaterialAddPage from "./RawMaterial/RawMaterialAddPage";

import FixedCostAllAddPage from "./FixedCost/FixedCostAllAddPage";
import FixedCostAllPage from "./FixedCost/FixedCostAllPage";

import AddExpensesPage from "./AddExpensesPage";

import PackageAllPage from "./Package/PackageAllPage";
import PackageAddPage from "./Package/PackageAddPage";

import WorkersAddPage from "./Workers/WorkersAddPage";
import WorkersAllPage from "./Workers/WorkersAllPage";

import Electricity from "./Electricity/Electricity";

import RazGrupasAddPage from "./Workers/RazGrupasAddPage";
import AlcoholTax from "./AlcoholTax/AlcoholTax";

import WarningDelete from "./WarningDelete";
import FileСhoice from "./FileСhoice";

import {
  HashRouter as Router,
  Switch,
  Route,
  // useParams,
  // Link
} from "react-router-dom";

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

ReactDOM.render(
  <>
    <Router>
      <Switch>
        <Route exact path="/">
          <MainPage />
          {/* <FileСhoice /> */}
        </Route>
        <Route exact path="/file">
          <FileСhoice />
        </Route>
        <Route exact path="/product-*">
          <ScrollToTop />
          <ProductRouting />
        </Route>
        <Route exact path="/group-*">
          <ScrollToTop />
          <GroupRouting />
        </Route>
        <Route
          exact
          path="/expenses-add-window/:destinationEntryNameTemp/:infoTemp"
        >
          {/* <AddRawMaterialToProductPage /> */}
          <AddExpensesPage />
        </Route>
        <Route exact path="/raw-material-*">
          <ScrollToTop />
          <RawMaterialRouting />
        </Route>
        <Route exact path="/fixed-cost-all">
          <ScrollToTop />
          <FixedCostAllPage />
        </Route>
        <Route exact path="/fixed-cost-all-add">
          <ScrollToTop />
          <FixedCostAllAddPage />
        </Route>
        <Route exact path="/package-all">
          <ScrollToTop />
          <PackageAllPage />
        </Route>
        <Route exact path="/package-add">
          <PackageAddPage />
        </Route>
        <Route exact path="/workers-add">
          <WorkersAddPage />
        </Route>
        <Route exact path="/workers-all">
          <ScrollToTop />
          <WorkersAllPage />
        </Route>
        <Route exact path="/raz-grupas-add/:productName/:type">
          <RazGrupasAddPage />
        </Route>
        <Route exact path="/electricity">
          <ScrollToTop />
          <Electricity />
        </Route>
        <Route exact path="/alcohol-tax">
          <AlcoholTax />
        </Route>
        <Route exact path="/warning-delete">
          <WarningDelete />
        </Route>
        <Route>
          <NoMatch />
        </Route>
      </Switch>
    </Router>
  </>,
  document.getElementById("root")
);

function NoMatch() {
  return <h1>404 Error</h1>;
}

function ProductRouting() {
  return (
    <>
      <Switch>
        <Route exact path="/product-:kods">
          <ProductPage />
        </Route>
      </Switch>
    </>
  );
}

function RawMaterialRouting() {
  return (
    <>
      <Switch>
        <Route exact path="/raw-material-all">
          <RawMaterialAllPage />
        </Route>
        <Route exact path="/raw-material-group">
          <RawMaterialAllPage />
        </Route>
        <Route exact path="/raw-material-add">
          <RawMaterialAddPage />
        </Route>
      </Switch>
    </>
  );
}

function GroupRouting() {
  return (
    <>
      <Switch>
        <Route exact path="/group-:groupName">
          <GroupPage />
        </Route>
      </Switch>
    </>
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
