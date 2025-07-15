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
function quoteIfContainsSpace(input) {

  const config = vscode.workspace.getConfiguration("fileFolderTool");


  const process = (str) => {

    if (config.alwaysQuotePath) {
      const escaped = str.replace(/"/g, '\\"');
      return `"${escaped}"`;
    } else if (config.quotePathIfSpace) {
      if (str.includes(' ')) {
        const escaped = str.replace(/"/g, '\\"');
        return `"${escaped}"`;
      }
    }
    return str;
  };

  if (Array.isArray(input)) {
    return input.map(process);
  } else if (typeof input === 'string') {
    return process(input);
  } else {
    throw new TypeError('Input must be a string or an array of strings.');
  }
}

function activate(context) {
  const getActiveFile = () => vscode.window.activeTextEditor?.document?.fileName;

  const copyToClipboard = async (text) => {
    await vscode.env.clipboard.writeText(text);
    const lines = text.split("\n");
    if (lines.length = 1) {
      vscode.window.showInformationMessage(`Copied: ${text}`);
    } else {
      vscode.env.clipboard.writeText(lines[0].trim() + ", and more...");
    }
  };

  const commands = [
    {
      command: 'fft.copyFileName',
      callback: () => {
        const file = getActiveFile();
        if (file) copyToClipboard(quoteIfContainsSpace(path.basename(file)));
      }
    },
    {
      command: 'fft.copyFileNameWithoutExtension',
      callback: () => {
        const file = getActiveFile();
        if (file) {
          const { name } = path.parse(file);
          name = quoteIfContainsSpace(name);
          copyToClipboard(name);
        }
      }
    },
    {
      command: 'fft.copyDirectoryPath',
      callback: () => {
        const file = getActiveFile();
        if (file) copyToClipboard(quoteIfContainsSpace(path.dirname(file)));
      }
    },
    {
      command: 'fft.copyFullPath',
      callback: () => {
        const file = getActiveFile();
        if (file) copyToClipboard(quoteIfContainsSpace(file));
      }
    },
    {
      command: 'fft.copyAllFileName',
      callback: () => {
        const paths = GetPaths();
        const filenames = paths.map(p => path.basename(p)).filter((v, i, a) => a.indexOf(v) === i).sort();
        vscode.env.clipboard.writeText(quoteIfContainsSpace(filenames).join("\n"))
      }
    },
    {
      command: 'fft.copyAllFileNameWithoutExtension',
      callback: () => {
        const paths = GetPaths();
        const filenames = paths.map(p => path.parse(p).name).filter((v, i, a) => a.indexOf(v) === i).sort();
        vscode.env.clipboard.writeText(quoteIfContainsSpace(filenames).join("\n"))
      }
    },
    {
      command: 'fft.copyAllDirectoryPath',
      callback: () => {
        const paths = GetPaths();
        const filenames = paths.map(p => path.dirname(p)).filter((v, i, a) => a.indexOf(v) === i).sort();
        vscode.env.clipboard.writeText(quoteIfContainsSpace(filenames).join("\n"))
      }
    },
    {
      command: 'fft.copyAllFullPath',
      callback: () => {
        const paths = GetPaths();
        const filenames = paths.sort();
        vscode.env.clipboard.writeText(quoteIfContainsSpace(filenames).join("\n"))
      }
    }
  ];

  for (const cmd of commands) {
    const disposable = vscode.commands.registerCommand(cmd.command, cmd.callback);
    context.subscriptions.push(disposable);
  }
}

function GetPaths() {
  const fsPaths = vscode.workspace.textDocuments.map(doc => doc.uri.fsPath);
  const documentFsPaths = vscode.window.visibleTextEditors.map(eidtor => eidtor.document.uri.fsPath);
  const tabPaths = vscode.window.tabGroups.all.flatMap(({ tabs }) => tabs.map(tab => {
    if (tab.input instanceof vscode.TabInputText || tab.input instanceof vscode.TabInputNotebook) {
      return tab.input.uri.fsPath;
    }

    if (tab.input instanceof vscode.TabInputTextDiff || tab.input instanceof vscode.TabInputNotebookDiff) {
      return tab.input.original.fsPath;
    }

    return null;
  })).filter(Boolean);
  const distinctPaths = [...new Set([...fsPaths.concat(documentFsPaths).concat(tabPaths)]
    .filter(path => !path.startsWith("git") &&
      !path.endsWith("git") &&
      path !== null))];
  return distinctPaths;
}

function deactivate() { }

module.exports = {
  activate,
  deactivate
};