const { app, BrowserWindow, ipcMain, Menu } = require('electron'); 
const uuid = require('uuid/v4');

/**@type {{id: String, window: BrowserWindow}[]}
let windows = [];
let dev = false;
/**
 * FUNCTION: CREATE REACT APP WINDOW
 * PURPOSE:  REUSABLE FUNCTION FOR CREATING NEW ELECTRON BrowserWindow INSTANCES
 */
function createReactAppWindow(windows, { dev, baseDir, reactRouterPath, reactRouteParams, windowTitle, windowWidth, windowHeight }) {
  let id = uuid();
  let window = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    show: false,
    title: windowTitle,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      nativeWindowOpen: false,
    }
  });
  browserWindowCollection.push({id, window});

  let indexPath;
  // DEV MODE, IF WE ARE RUNNING FROM SOURCE
  if(dev) {
    indexPath = url.format({
      protocol: 'http:',
      host: 'localhost:8080',
      pathname: 'index.html',
      slashes: 'true'
    });
  // IF WE ARE IN PRODUCTION MODE, RUNNING A BUILT VERSION OF THE APP
  } else {
    indexPath = url.format({
      protocol: 'file:',
      pathname: path.join(baseDir, 'dist', 'index.html'),
      slashes: true
    });
  }

  // THIS IS WHERE WE CUSTOMIZE WHICH WINDOW WILL BE DISPLAYED BY 
  // USING REACT HASH ROUTER PATH / PARAMETERS
  // THIS WILL BE LOADED ON THE REACT SIDE TO RENDER THE RIGHT
  // COMPONENTS FOR THE USER
  if( reactRouterPath ) {
    indexPath = indexPath.concat(`#${reactRouterPath}${reactRouteParams ? `/${reactRouteParams}` : ''}` );
  }
  window.loadURL(indexPath);
}

// A BASIC FUNCTION TO CREATE THE MAIN WINDOW FOR OUR APP WHICH
// THE USER SEES WHEN THEY OPEN THE APPLICATION
function createMainWindow() {
  createReactAppWindow(windows, { dev, baseDir: __dirname, reactRouterPath: '/SplashPage', reactRouteParams: null, windowTitle: 'my main window' })
}

// WHEN THE APP FIRST ACTIVATES OPEN THE WINDOW
app.on('activate', () => {
  if(windows.length === 0) {
    createMainWindow();
  }
});

// HERE WE HAVE AN IPC CHANNEL CALLED 'NEW_WINDOW' WHICH WE WILL 
// SEND MESSAGES TO FROM OUR APP, IN ORDER TO CREATE THE WINDOW
// FOR EACH KIND OF WINDOW WE WANT, WE NEED TO HAVE ANOTHER case HERE
// THIS WILL CALL OUR FUNCTION TO CREATE THE WINDOW WHENEVER IT 
// RECEIVES A MESSAGE
ipcMain.on('NEW_WINDOW', (event, arg) => {
  var argObject = arg[0];
  if(argObject && argObject.type) {
    switch(argObject.type) {
      case 'MY_NEW_WINDOW_1_TYPE':
        createReactAppWindow(windows, { dev, baseDir: __dirname, reactRouterPath: '/MyPath1', reactRouteParams: argObject.param, windowTitle: 'my test window' });
        break;
    }
  }
});