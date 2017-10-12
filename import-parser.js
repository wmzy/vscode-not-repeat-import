const _ = require('lodash');

function getModule(code, fromIndex) {
  while(fromIndex < code.length) {
    const c = code.charAt(fromIndex++);
    if (c === '"' || c === "'") break;
  }
  const start = fromIndex;

  while(fromIndex < code.length) {
    const c = code.charAt(fromIndex++);
    if (c === '"' || c === "'") break;
  }
  return code.slice(start, fromIndex - 1);
}
exports.parse = function(code) {
  const imports = [];

  let fromIndex = code.indexOf('from');
  while (fromIndex > 0) {
    const m = getModule(code, fromIndex);
    let importIndex = code.lastIndexOf('import', fromIndex);
    if (importIndex >= 0) {
      const exportString = code.slice(importIndex + 'import'.length, fromIndex).trim();
      const [defaultExport, otherExports] = exportString.split('{');
      imports.push({
        exports: _.words(otherExports, /[^, {}]+/g),
        default: defaultExport,
        module: m
      });
    }
    fromIndex = code.indexOf('from', fromIndex + 1);
  }

  return imports;
}
