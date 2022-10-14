/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import LCUConnector from 'lcu-connector';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import Aggregation from './utils/aggregation';

const connector = new LCUConnector();

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      sandbox: false,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  const appIsLocked = app.requestSingleInstanceLock();
  if (!appIsLocked) {
    app.quit();
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.on('second-instance', (_e, argv) => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        log.warn(
          'Attempt to open another instance of the app. Focusing the existing window.'
        );
        mainWindow.focus();

        // Check if the second-instance was fired through a protocol link.
        const isProtocol = argv.find((arg) =>
          arg.startsWith('showcase-app://')
        );
        if (isProtocol) {
          log.info('protocol link detected');
          const formattedURL: URL = new URL(isProtocol);
          const aggregation = new Aggregation(
            mainWindow?.webContents,
            formattedURL
          );
          aggregation.init();
        }
        if (process.defaultApp) {
          if (process.argv.length >= 2) {
            app.setAsDefaultProtocolClient('showcase-app', process.execPath, [
              '-r',
              path.join(
                __dirname,
                '..',
                '..',
                'node_modules',
                'ts-node',
                'register',
                'transpile-only.js'
              ),
              path.resolve(),
            ]);
          }
        } else {
          app.setAsDefaultProtocolClient('showcase-app');
        }
      }
    });
  }

  mainWindow.on('ready-to-show', async () => {
    const hasPath = await LCUConnector.getLCUPathFromProcess();
    if (!hasPath) mainWindow?.webContents?.send('status-update', 'error');
    mainWindow?.webContents?.send('status-update', 'ready');
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
