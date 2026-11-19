// const jsonString = require('json-stringify-pretty-compact')
const fs = require('fs')
const compactStringify = require('./compactStringify.js')

let idl = require('../projects/test/idl.json')

idl.instructions = []
idl.events = []
idl.errors = []

const whitelistedTypes = new Set()
const typeMap = {}
idl.types?.forEach(t => typeMap[t.name] = t)
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

  if (typeObj.type.kind === 'enum' && Array.isArray(typeObj.type.variants)) {
    typeObj.type.variants.forEach(v => {
      if (!v.fields) {
        const name = getDefinedName(v)
        if (name && typeMap[name]) checkType(typeMap[name])
        return;
      }
      v.fields.forEach(f => {
        const name = getDefinedName(f)
        if (name && typeMap[name]) checkType(typeMap[name])
      })
    })
  }

  if (typeObj.type.kind !== 'struct') return;

  typeObj.type.fields.forEach(f => {
    const isVec = f.type?.vec?.defined?.name
    if (isVec) {
      checkType(typeMap[isVec])
      return;
    }

    if (typeof f.type === 'object') {
      const tName = getDefinedName(f.type)
      if (tName && typeMap[tName]) checkType(typeMap[tName])
      if (f.type.array)
        f.type.array.forEach(a => {
          const name = getDefinedName(a)
          if (name && typeMap[name]) checkType(typeMap[name])
        })
    }
    if (f.type === 'enum' && Array.isArray(f.type.variants)) {
      f.type.variants.forEach(v => {
        if (!v.fields) {
          const name = getDefinedName(v)
          if (name && typeMap[name]) checkType(typeMap[name])
          return;
        }
        v.fields.forEach(f => {
          const name = getDefinedName(f)
          if (name && typeMap[name]) checkType(typeMap[name])
        })
      })
    }
  })
}

function getDefinedName(obj) {
  return obj.defined?.name ?? (typeof obj.defined === 'string' ? obj.defined : null)
}

console.log(JSON.stringify({ whitelistedTypeMap: Object.keys(whitelistedTypeMap), accountMap: Object.keys(accountMap), whitelistedTypes: Array.from(whitelistedTypes) }, null, 2))
idl.types = Object.values(whitelistedTypeMap)


const res = compactStringify(idl, { maxLength: 153 })
fs.writeFileSync(__dirname + '/../projects/test/idl.json', res)