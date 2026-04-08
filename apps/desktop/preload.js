const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('novaDesktop', {
  platform: process.platform,
  mode: 'desktop',
});
