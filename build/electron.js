const path = require("path");
var fs = require("fs");

const { ipcMain } = require("electron");
const { app, BrowserWindow } = require("electron");
const { Menu } = require("electron");
const { v4: uuid } = require("uuid");
const isDev = require("electron-is-dev");
const lodash = require("lodash");

let windows = [];
let mainWindowId;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createMainWindow);

process.on("uncaughtException", function (error) {
  console.log(error);
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// send raw material data to renderer process
// ipcMain.on('raw-material-all:get', (event, arg) => {
//   // Read the json file
//   fs.readFile(__dirname + '/../data/raw-material-all.json', 'utf8', function(err, data) {
//     if (err) throw err;
//     // Synchronous event emmision
//     event.returnValue = data;
//   })
// });

ipcMain.on("get-data", (event, arg) => {
  let dataPath = path.join(process.cwd(), "data", "data.json");

  let data = fs.readFileSync(dataPath);
  data = JSON.parse(data);
  event.returnValue = JSON.stringify(data);
});

ipcMain.on("modify-data", (event, arg) => {
  let newData = JSON.parse(arg[0]);
  let refresh = arg[1];

  let dataPath = path.join(process.cwd(), "data", "data.json");
  let data = fs.readFileSync(dataPath);
  data = JSON.parse(data);

  // Write modified data to the file
  fs.writeFileSync(dataPath, JSON.stringify(newData, null, 4));
  event.returnValue = "Everything good";

  if (refresh === undefined || refresh === true) {
    // Reload the main window
    // windows.forEach(element => {
    //   element.window.webContents.reload();
    // })

    let winObj = lodash.chain(windows).find({ id: mainWindowId }).value();
    winObj["window"].reload();
  }
});

// send raw material data to renderer process
// ipcMain.on('products-all:get', (event, arg) => {
//   // Read the json file

//   let groupData = fs.readFileSync( __dirname + '/../data/groups-all.json');
//   let productData = fs.readFileSync( __dirname + '/../data/products-all.json');

//   groupData = JSON.parse(groupData)
//   productData = JSON.parse(productData)

//   let data = {
//     "groups" : groupData,
//     "products" : productData
//   }

//   event.returnValue = JSON.stringify(data);
// });

ipcMain.on("warning-delete", (event, arg) => {
  createReactAppWindow(windows, {
    baseDir: __dirname,
    reactRouterPath: "/warning-delete",
    windowTitle: "Внимание!",
    windowWidth: 400,
    windowHeight: 200,
    devTools: false,
    warningWindow: true,
  });
});

ipcMain.on("confirm-delete", (event, arg) => {
  let winObj = lodash.chain(windows).find({ id: mainWindowId }).value();

  // Send the delete confirm to the main renderer process
  winObj["window"].webContents.send("confirm-delete");
  // Close the warning window

  let warningWinObj = lodash
    .chain(windows)
    .find({ warningWindow: true })
    .value();

  warningWinObj["window"].close();
});

ipcMain.on("cancel-delete", (event, arg) => {
  // Close the warning window
  let warningWinObj = lodash
    .chain(windows)
    .find({ warningWindow: true })
    .value();

  warningWinObj["window"].close();
});

ipcMain.on("expenses-add-window", (event, arg) => {
  let productName = arg[0];
  let type = arg[1];

  createReactAppWindow(windows, {
    baseDir: __dirname,
    reactRouterPath:
      "/expenses-add-window/" + encodeURIComponent(productName) + "/" + type,
    windowTitle: "Add expence",
    windowWidth: 800,
    windowHeight: 400,
    devTools: false,
    mainWindow: false,
  });
});

ipcMain.on("product-fixed-cost:add-general-window", (event, arg) => {
  let productName = arg[0];
  let type = arg[1];

  createReactAppWindow(windows, {
    baseDir: __dirname,
    reactRouterPath:
      "/product-fixed-cost-add-general-" +
      encodeURIComponent(productName) +
      "/" +
      type,
    windowTitle: "Add fixed cost",
    windowWidth: 400,
    windowHeight: 400,
    devTools: false,
    mainWindow: false,
  });
});

ipcMain.on("get", (event, arg) => {
  let path = arg[0];
  let status = arg[1];
  let fileLocation = arg[2];

  let data = fs.readFileSync(__dirname + fileLocation);
  data = JSON.parse(data);

  let arr = "";

  // Get the indexes
  path = getIndexes([path, status, fileLocation]);
  // Reduce the object to desired element
  arr = path.reduce((a, key) => a[key], data);
  event.returnValue = JSON.stringify(arr);
});

ipcMain.on("raw-material:ask-for-window", (event, arg) => {
  createReactAppWindow(windows, {
    baseDir: __dirname,
    reactRouterPath: "/raw-material-add",
    windowTitle: "Add raw material",
    windowWidth: 400,
    windowHeight: 500,
    devTools: false,
    mainWindow: false,
  });
});

ipcMain.on("package:ask-for-window", (event, arg) => {
  createReactAppWindow(windows, {
    baseDir: __dirname,
    reactRouterPath: "/package-add",
    windowTitle: "Add package element",
    windowWidth: 400,
    windowHeight: 400,
    devTools: false,
    mainWindow: false,
  });
});

ipcMain.on("fixed-cost:ask-for-window", (event, arg) => {
  createReactAppWindow(windows, {
    baseDir: __dirname,
    reactRouterPath: "/fixed-cost-all-add",
    windowTitle: "Add fixed cost",
    windowWidth: 400,
    windowHeight: 400,
    devTools: false,
    mainWindow: false,
  });
});

ipcMain.on("workers:ask-for-window", (event, arg) => {
  createReactAppWindow(windows, {
    baseDir: __dirname,
    reactRouterPath: "/workers-add",
    windowTitle: "Add workers",
    windowWidth: 400,
    windowHeight: 400,
    devTools: false,
    mainWindow: false,
  });
});

ipcMain.on("razGrupas:ask-for-window", (event, arg) => {
  let info = JSON.parse(arg[0]);
  let productName = info["productName"];
  let type = info["type"];
  createReactAppWindow(windows, {
    baseDir: __dirname,
    reactRouterPath:
      "/raz-grupas-add/" + encodeURIComponent(productName) + "/" + type,
    windowTitle: "Add production group",
    windowWidth: 400,
    windowHeight: 400,
    devTools: false,
    mainWindow: false,
  });
});

function createMainWindow() {
  createReactAppWindow(windows, {
    baseDir: __dirname,
    reactRouterPath: "/",
    reactRouteParams: null,
    windowWidth: 1000,
    windowHeight: 600,
    windowTitle: "my main window",
    devTools: true,
    mainWindow: true,
  });
}

function createReactAppWindow(
  windows,
  {
    baseDir,
    reactRouterPath,
    windowTitle,
    windowWidth,
    windowHeight,
    devTools,
    mainWindow = false,
    windowFocus = false,
    warningWindow = false,
  }
) {
  let id = uuid();
  if (mainWindow === true) {
    mainWindowId = id; // Save the id for later retrieval
  }

  let window = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    show: false,
    title: windowTitle,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      nativeWindowOpen: false,
      enableRemoteModule: true,
      contextIsolation: false,
    },
  });

  if (windowFocus) {
    window.focus();
  }

  window.once("ready-to-show", () => {
    window.show();
  });

  window.on("closed", () => {
    // Delete the window from the array of windows
    // Get the object
    let winObj = windows.find((x) => x.id === id);
    // Get the index of an object
    const index = windows.indexOf(winObj);
    if (index > -1) {
      // Delete the entry from array
      windows.splice(index, 1);
    }
  });

  windows.push({ id, window, warningWindow });
  window.menuBarVisible = false;

  if (isDev) {
    window.webContents.openDevTools({ mode: "detach" });
  }

  // Put # because hashrouter is used instead of browserrouter
  let indexPath = isDev
    ? "http://localhost:3000#"
    : `file://${path.join(__dirname, "../build/index.html#")}`;

  // THIS IS WHERE WE CUSTOMIZE WHICH WINDOW WILL BE DISPLAYED BY
  // USING REACT HASH ROUTER PATH / PARAMETERS
  // THIS WILL BE LOADED ON THE REACT SIDE TO RENDER THE RIGHT
  // COMPONENTS FOR THE USER

  if (reactRouterPath) {
    // indexPath = indexPath.concat(`#${reactRouterPath}${reactRouteParams ? `/${reactRouteParams}` : ''}` );
    indexPath = indexPath.concat(`${reactRouterPath}`);
  }

  window.loadURL(indexPath);
}
