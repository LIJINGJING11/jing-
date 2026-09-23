const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('bootframe', {
  platform: process.platform,
  chooseFile: (kind) => ipcRenderer.invoke('choose-file', kind),
  chooseOutput: () => ipcRenderer.invoke('choose-output'),
  processImage: (payload) => ipcRenderer.invoke('process-image', payload),
  processImageBatch: (payload) => ipcRenderer.invoke('process-image-batch', payload),
  processVideo: (payload) => ipcRenderer.invoke('process-video', payload),
  compressVideo: (payload) => ipcRenderer.invoke('compress-video', payload),
  extractLogo: (payload) => ipcRenderer.invoke('extract-logo', payload),
  retouchScene: (payload) => ipcRenderer.invoke('retouch-scene', payload),
  removeFullScreenWatermark: (payload) => ipcRenderer.invoke('remove-fullscreen-watermark', payload),
  processPaidImage: (payload) => ipcRenderer.invoke('process-paid-image', payload),
  processPaidImageModel: (payload) => ipcRenderer.invoke('process-paid-image-model', payload),
  synthesizeSpeech: (payload) => ipcRenderer.invoke('synthesize-speech', payload),
  reveal: (filePath) => ipcRenderer.invoke('reveal-file', filePath),
  filePath: (file) => webUtils.getPathForFile(file),
  onProgress: (callback) => {
    const listener = (_event, value) => callback(value);
    ipcRenderer.on('task-progress', listener);
    return () => ipcRenderer.removeListener('task-progress', listener);
  }
});
