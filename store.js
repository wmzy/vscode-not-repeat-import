const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const leven = require('leven');
const importParser = require('./import-parser');

let moduleImport = {};

exports.parseFile = function (filename) {
  if (_.isObject(filename)) filename = filename.fsPath;
  fs.readFile(filename, 'utf8', (err, code) => {
    if (err) {
      console.error(err);
      return;
    }
    const fileModule = {};
    importParser.parse(code).forEach(im => {
      // todo: 转义
      const m = _.startsWith(im.module, '.') ? im.module = path.join(path.dirname(filename), im.module) : im.module;
      _.forEach(im.exports, e => {
        fileModule[e + '?' + m] = true;
      })
      if (im.default) {
        fileModule[im.default + '?' + m + '?default'] = true;
      }
    });
    moduleImport[filename] = fileModule;
  });
};

exports.removeFile = function (filename) {
  if (_.isObject(filename)) filename = filename.fsPath;
  delete moduleImport[filename];
}

exports.getCompletionItems = function (wordPrefix, document) {
  const moduleMaps = _.values(_.omit(moduleImport, document.fileName));
  const modules = _.flatten(_.map(moduleMaps, _.keys));
  return _.uniq(modules)
    .map(k => {
      const [token, module, isDefault] = _.split(k, '?');
      const moduleFrom = relative(document.fileName, module);
      return {
        token,
        moduleFrom,
        isDefault: !!isDefault,
        module: `import ${isDefault ? token : '{' + token + '}'} from '${moduleFrom}'`
      };
    })
    .sort((a, b) => leven(wordPrefix, a.token) - leven(wordPrefix, b.token));
}

function relative(from, to) {
  if (!path.isAbsolute(to)) return to;
  const p = path.relative(path.dirname(from), to).replace(/\\/g, '/')
  if (p.startsWith('.')) return p;
  return './' + p;
}
