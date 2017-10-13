// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const _ = require('lodash');
const vscode = require('vscode');
const completionItemProvider = require('./completion-item-provider');
const store = require('./store');
const importTokenCommand = require('./import-token-command');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('vscode-not-repeat-import active');
    if (!vscode.workspace.rootPath) return;

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    context.subscriptions.push(
      vscode.commands.registerTextEditorCommand('extension.importToken', importTokenCommand)
    );

    vscode.workspace.findFiles('**/**/*.js', '**/node_modules/**', 1000)
    .then(files => {
      _.forEach(files, store.parseFile);
    }, e => console.error(e))

    const fsw = vscode.workspace.createFileSystemWatcher('**/*.js', true);
    fsw.onDidChange(store.parseFile);
    fsw.onDidDelete(store.removeFile)

    context.subscriptions.push(
      vscode.languages.registerCompletionItemProvider(
          ['javascript', 'typescript', 'javascriptreact', 'typescriptreact'],
          completionItemProvider
      )
    );
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
