const vscode = require('vscode');
const store = require('./store');

exports.provideCompletionItems = async function (document, position, token) {
    const range = document.getWordRangeAtPosition(position);
    if (!range) return [];
    const {start} = range;
    const line = document.lineAt(range.start).text;
    if (line[start.character - 1] === '.') return [];
    const wordPrefix = line.slice(start.character, position.character);
    return store.getCompletionItems(wordPrefix, document)
      .map(item => ({
        label: item.token,
        kind: vscode.CompletionItemKind.Reference,
        detail: item.module,
        command: {
          title: 'Import Token',
          command: 'extension.importToken',
          arguments: [item.token, item.moduleFrom, item.isDefault, false]}
      }));
}
