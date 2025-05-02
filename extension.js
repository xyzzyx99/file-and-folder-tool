const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const child_process = require('child_process');

// https://github.com/yinyongxian/file-and-folder-tool
// https://code.visualstudio.com/api
// https://marketplace.visualstudio.com/manage/publishers/file-and-folder-tool

// Publish: vsce package --> vsce publish

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
      command: 'fft.copyFileNameWithoutExtension',
      callback: () => {
        const file = getActiveFile();
        if (file) {
          const { name } = path.parse(file);
          copyToClipboard(name);
        }
      }
    },
    {
      command: 'fft.copyDirectoryPath',
      callback: () => {
        const file = getActiveFile();
        if (file) copyToClipboard(path.dirname(file));
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
