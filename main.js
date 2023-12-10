const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const sqlite3 = require('sqlite3').verbose();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'Js', 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
    title:"Parent"
  });
  mainWindow.loadFile("src/login.html");
  mainWindow.setMenuBarVisibility(false); 
  mainWindow.openDevTools();
} 

const dbPath = path.join(__dirname, 'Database', 'LoginAppDatabase.db');
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log('Database successfully connected!');
    }
  });

// Receive login attempt from renderer process
ipcMain.on("login", (event, { username,  password }) => {
  // Check username and password in the database
  const query = "SELECT * FROM users WHERE username = ? AND password = ?";
  db.get(query, [username, password], (err, row) => {
      console.log(username);
      console.log(password);

    if (err) {
      console.error(err);
      event.reply("login-response", { success: false, message: "Error !!!" });
    } else if (row) {
      // Successful login
      event.reply("login-response", { success: true, message: "Login successful !!!" });
      // Open the dashboard window
      // openDashboardWindow();
      loadPage("dashboard.html");
    } else { 
      // console.log(username);
      // console.log(password);
      // Incorrect username or password
      event.reply("login-response", { success: false, message: "Incorrect username or password !!!" }); 
      console.log("Please enter the correct username and password !!!");
    }
  });
});

// Handle other routes
ipcMain.on("load-page", (event, pageName) => {
  loadPage(pageName);
});

function loadPage(pageName) {
  mainWindow.loadFile(path.join(__dirname, pageName));
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    console.log("Database Connection Closed !!!")
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});