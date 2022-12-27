const ethers = require('ethers')
const glob = require('glob')
const jsonfile = require('jsonfile')

const rootFolder = '../projects'
const rootFolderTest = '../projects/yfii'

// https://docs.soliditylang.org/en/latest/abi-spec.html
let knownTypes = [
  'string', 'address', 'bool',
  'int', 'int8', 'int16', 'int32', 'int64', 'int128', 'int256',
  'uint', 'uint8', 'uint16', 'uint32', 'uint64', 'uint128', 'uint256',
];

([...knownTypes]).forEach(i => knownTypes.push(i+'[]')) // support array type for all known types
knownTypes = new Set(knownTypes)

glob(rootFolder+'/**/*.json', {}, async (e, files) => {
  if (e) throw e
  console.log('JSON file count', files.length)
  const objs = files.map(file => ({
    file,
    data: jsonfile.readFileSync(file)
  }))
  const isTransformables = objs.filter(i => isTransformable(i.data))
  console.log(isTransformables.length)
  const fileWriteOptions = { spaces: 2, finalEOL: false }
  isTransformables.forEach(i => i.newData = transform(i.data))
  isTransformables.forEach(i => jsonfile.writeFile(i.file, i.newData, fileWriteOptions))
})

function isTransformable(obj, meta) {
  if (typeof obj !== 'object' || Array.isArray(obj)) return;
  const i = Object.values(obj)[0]
  return i.stateMutability === 'view' && i.type === 'function'
}

function transform(obj) {
  const res = {}
  for (const [key, value] of Object.entries(obj)) {
    const iLen = value.inputs.length === 0 
    const oLen = value.outputs.length === 1
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