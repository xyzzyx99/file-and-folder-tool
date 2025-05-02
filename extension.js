const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const child_process = require('child_process');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const getActiveFile = () => vscode.window.activeTextEditor?.document?.fileName;

  const copyToClipboard = async (text) => {
    await vscode.env.clipboard.writeText(text);
    vscode.window.showInformationMessage(`Copied: ${text}`);
  };

  const commands = [
    {
      command: 'fft.copyFileName',
      callback: () => {
        const file = getActiveFile();
        if (file) copyToClipboard(path.basename(file));
      }
    },
    {
      command: 'fft.copyFullPath',
      callback: () => {
        const file = getActiveFile();
        if (file) copyToClipboard(file);
      }
    },
    {
      command: 'fft.copyDirectoryPath',
      callback: () => {
        const file = getActiveFile();
        if (file) copyToClipboard(path.dirname(file));
      }
    },
    {
      command: 'fft.openDirectory',
      callback: () => {
        const file = getActiveFile();
        if (file) {
          const dir = path.dirname(file);
          if (process.platform === 'win32') {
            child_process.exec(`start "" "${dir}"`);
          } else if (process.platform === 'darwin') {
            child_process.exec(`open "${dir}"`);
          } else {
            child_process.exec(`xdg-open "${dir}"`);
          }
        }
      }
    }
  ];

  for (const cmd of commands) {
    const disposable = vscode.commands.registerCommand(cmd.command, cmd.callback);
    context.subscriptions.push(disposable);
  }
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
