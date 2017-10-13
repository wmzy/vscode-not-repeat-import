const vscode = require('vscode');

module.exports = function (editor, edit, token, moduleString, isDefault, aliasOf) {
  const doc = editor.document;
  const code = doc.getText();
  const moduleIndex = code.search(new RegExp(`from\w['"]${moduleString}['"]`));
  if (moduleIndex < 0) {
    if (aliasOf) token = `${aliasOf} as ${token}`;
    if (!isDefault) token = `{${token}}`;
    edit.insert(new vscode.Position(0, 0), `import ${token} from '${moduleString}'\n`);
    return;
  }
}
