// const jsonString = require('json-stringify-pretty-compact')
const fs = require('fs')

const stringOrChar = /("(?:[^\\"]|\\.)*")|[:,]/g;
let idl = require('../projects/test/idl.json')

idl.instructions = []
idl.events = []
idl.errors = []

const whitelistedTypes = new Set()
const typeMap = {}
idl.types.forEach(t => typeMap[t.name] = t)
const whitelistedTypeMap = {}
const accountMap = {}
idl.accounts.forEach(a => accountMap[a.name] = a)

idl.accounts.forEach(checkType)

function checkType(typeObj) {
  let isAccountObjInTypeMap = false
  if (whitelistedTypes.has(typeObj.name)) return;
  whitelistedTypes.add(typeObj.name)
  if (!typeObj.type && accountMap[typeObj.name]) { // it could be account whose type is present in the typeMap
    if (typeMap[typeObj.name]) {
      typeObj = typeMap[typeObj.name]
      isAccountObjInTypeMap = true
    }
    else return;
  }

  if (isAccountObjInTypeMap || !accountMap[typeObj.name])
    whitelistedTypeMap[typeObj.name] = typeObj

  if (typeObj.type.kind !== 'struct') return;
  typeObj.type.fields.forEach(f => {
    if (typeof f.type === 'object') {
      const tName = f.type.defined?.name
      if (tName && typeMap[tName]) checkType(typeMap[tName])
      if (f.type.array)
        f.type.array.forEach(a => {
          if (a.defined && typeMap[a.defined.name]) checkType(typeMap[a.defined.name])
        })
    }
  })
}

console.log(JSON.stringify({whitelistedTypeMap: Object.keys(whitelistedTypeMap), accountMap: Object.keys(accountMap), whitelistedTypes: Array.from(whitelistedTypes)}, null, 2))
idl.types = Object.values(whitelistedTypeMap)




const res = stringify(idl, { maxLength: 153 })
fs.writeFileSync(__dirname + '/../projects/test/idl.json', res)


// from json-stringify-pretty-compact

function stringify(passedObj, options = {}) {
  const indent = JSON.stringify(
    [1],
    undefined,
    options.indent === undefined ? 2 : options.indent
  ).slice(2, -3);

  const maxLength =
    indent === ""
      ? Infinity
      : options.maxLength === undefined
        ? 80
        : options.maxLength;

  let { replacer } = options;

  return (function _stringify(obj, currentIndent, reserved) {
    if (obj && typeof obj.toJSON === "function") {
      obj = obj.toJSON();
    }

    const string = JSON.stringify(obj, replacer);

    if (string === undefined) {
      return string;
    }

    const length = maxLength - currentIndent.length - reserved;

    if (string.length <= length) {
      const prettified = string.replace(
        stringOrChar,
        (match, stringLiteral) => {
          return stringLiteral || `${match} `;
        }
      );
      if (prettified.length <= length) {
        return prettified;
      }
    }

    if (replacer != null) {
      obj = JSON.parse(string);
      replacer = undefined;
    }

    if (typeof obj === "object" && obj !== null) {
      const nextIndent = currentIndent + indent;
      const items = [];
      let index = 0;
      let start;
      let end;

      if (Array.isArray(obj)) {
        start = "[";
        end = "]";
        const { length } = obj;
        for (; index < length; index++) {
          items.push(
            _stringify(obj[index], nextIndent, index === length - 1 ? 0 : 1) ||
            "null"
          );
        }
      } else {
        start = "{";
        end = "}";
        const keys = Object.keys(obj);
        const { length } = keys;
        for (; index < length; index++) {
          const key = keys[index];
          const keyPart = `${JSON.stringify(key)}: `;
          const value = _stringify(
            obj[key],
            nextIndent,
            keyPart.length + (index === length - 1 ? 0 : 1)
          );
          if (value !== undefined) {
            items.push(keyPart + value);
          }
        }
      }

      if (items.length > 0) {
        return [start, indent + items.join(`,\n${nextIndent}`), end].join(
          `\n${currentIndent}`
        );
      }
    }

    return string;
  })(passedObj, "", 0);
}
