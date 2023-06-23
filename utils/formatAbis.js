const ethers = require('ethers')
const glob = require('glob')
const jsonfile = require('jsonfile')
const fs = require('fs')

let data = require('../projects/test/abi.json')
const rootFolder = '../projects'
const rootFolderTest = '../projects/yfii'

// https://docs.soliditylang.org/en/latest/abi-spec.html
let knownTypes = [
  'string', 'address', 'bool',
  'int', 'int8', 'int16', 'int32', 'int64', 'int128', 'int256',
  'uint', 'uint8', 'uint16', 'uint32', 'uint64', 'uint128', 'uint256',
];

([...knownTypes]).forEach(i => knownTypes.push(i + '[]')) // support array type for all known types
knownTypes = new Set(knownTypes)

function run() {
  glob(rootFolder + '/**/*.json', {}, async (e, files) => {
    if (e) throw e
    console.log('JSON file count', files.length)
    const objs = files.map(file => ({
      file,
      data: jsonfile.readFileSync(file)
    }))
    const isTransformables = objs.filter(i => isTransformable(i.data, i.file))
    const isNotTransformables = objs.filter(i => !isTransformable(i.data, i.file)).filter(i => Object.values(i.data).some(i => typeof i !== 'string'))
    console.log(isNotTransformables.length)
    const files2 = isNotTransformables.map(i => i.file)
    console.log(JSON.stringify(files2, null, 2))
    // console.log(isTransformables.length)
    const fileWriteOptions = { spaces: 2, finalEOL: false }
    isTransformables.forEach(i => i.newData = transform(i.data, i.file))
    isTransformables.forEach(i => jsonfile.writeFile(i.file, i.newData, fileWriteOptions))
  })
}

const validStates = new Set(['view', 'pure', 'nonpayable'])
const isValidState = i => validStates.has(i.stateMutability) || i.constant === true

function isTransformable(obj, file) {
  if (typeof obj !== 'object' || Array.isArray(obj)) return false;
  const values = Object.values(obj)
  const isAbi0 = i => isValidState(i)
  const isAbi = i => (i.stateMutability === 'view' || i.stateMutability === 'pure' || i.stateMutability === 'nonpayable') && i.type === 'function'
  const i = values[0]
  if (!isAbi0(i)) return false
  const edgeCase = values.find(i => !isAbi(i))
  if (edgeCase) {
    const first = Object.values(edgeCase).pop()
    if (!Array.isArray(edgeCase) && !isAbi(first))
      console.log('edge case: ', file, edgeCase)
  }
  return !edgeCase
}

function transform(obj, file) {
  const res = {}
  for (const [key, value] of Object.entries(obj)) {
    if (['constructor', 'error'].includes(value.type)) {
      console.log('skipping element of type: ', value.type)
      continue;
    }
    if (!value.inputs) console.log('inputs missing', file)
    const iLen = value.inputs.length === 0
    const oLen = value.outputs?.length === 1
    const oType = oLen && value.outputs[0].type
    if (iLen && oLen && knownTypes.has(oType)) {
      res[key] = `${oType}:${value.name}`
    } else {
      const iface = new ethers.utils.Interface([value])
      res[key] = iface.format(ethers.utils.FormatTypes.full)[0]
    }
  }

  return res
}

function print() {
  let res = data
  if (data.name) data = [data]
  if (Array.isArray(data)) {
    res = {}
    data
    .filter(i => i.type === 'function' || i.type === 'event')
    // .filter(i => isTransformable({ test: i}))
    // .filter(i => i.stateMutability === 'view'  || i.stateMutability === 'pure')
    .forEach(i => res[i.name ?? 'ignore'] = i)
  }
  console.log(res)
  res = transform(res)
  fs.writeFileSync(__dirname+'/../projects/test/abi.json', JSON.stringify(res, null, 2))
  // console.log(res)
  console.log(JSON.stringify(res, null, 2))
}




print()

async function printRes(abi, target, api) {
  const res = {}
  await Promise.all(Object.entries(abi).map(async ([name, abi]) => {
    res[name] = await api.call({ abi, target})
  }))
  console.log(res)
}