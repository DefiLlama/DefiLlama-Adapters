const glob = require('glob')
const projectsDir = __dirname + '/../../projects'
const allLabelsFile = projectsDir + '/helper/coreAssets.json'
const allLabels = require(allLabelsFile)
const fs = require('fs')
const path = require('path')
const { ibcChains } = require('../../projects/helper/tokenMapping')

// const rootFolder = '../../projects'
// const projectsDir = '../../projects/zharta'
// const rootFolder = projectsDir + '/zharta'
const rootFolder = projectsDir

const ignoredChains = ['tezos', 'waves', 'algorand', 'klaytn', 'astar', 'iotex', 'elrond', 'defichain', 'cardano', ...ibcChains]

function run() {
  ignoredChains.forEach(i => delete allLabels[i])
  // console.table(Object.entries(allLabels).map(([c, mapping]) => {    return [c, Object.values(mapping).length]  }).sort((a, b) => b[1] - a[1]))

  // return;

  glob(rootFolder + '/**/*.js', {}, async (e, files) => {
    console.log('JSON file count', files.length)
    // console.log(files)
    files.forEach(updateFile)
  })
}

run()

const ignoredFolders = ['symbiosis-finance', 'node_modules']

function updateFile(file) {
  if (ignoredFolders.some(s => file.includes(s))) return;
  let relativePath = path.relative(file + '/..', allLabelsFile)
  if (relativePath.startsWith('coreAssets')) relativePath = './' + relativePath
  const requireStr = `const ADDRESSES = require('${relativePath}')\n`
  let fileStr = fs.readFileSync(file, 'utf-8')
  const importedAddresses = fileStr.includes('coreAssets.json')
  let updateFile = false

  Object.entries(allLabels).forEach(([chain, mapping]) => {
    const label = ['ADDRESSES', chain]
    if (chain === 'null') {
      updateFileStr([...label].join('.'), mapping, file)
    } else {
      Object.entries(mapping).forEach(([symbol, addr]) => {
        updateFileStr([...label, symbol].join('.'), addr, file)
      })
    }
  })
  if (!importedAddresses && updateFile)
    fileStr = requireStr + fileStr
  fs.writeFileSync(file, fileStr, { encoding: 'utf-8' })

  function updateFileStr(label, address, file) {
    if (!address || !address.length) return;
    if (!updateFile) {
      updateFile = (new RegExp(address, 'i')).test(fileStr)
      // if (updateFile)
      //   console.log(updateFile, address, new RegExp(address, 'i'), file)
    }
    if (!updateFile) return;
    const tokensBareRegex = new RegExp('["\']' + address + '["\']\\s*:', 'gi')
    const tokensBareRegex2 = new RegExp('["\']' + address + '["\']', 'gi')
    const tokensRegex = new RegExp('(["\'])(\\w+:)' + address + '["\']\\s*:', 'gi')
    const tokensRegex2 = new RegExp('(["\'])(\\w+:)' + address + '["\']', 'gi')
    fileStr = fileStr.replace(tokensBareRegex, `[${label}]:`)
    fileStr = fileStr.replace(tokensBareRegex2, label)
    fileStr = fileStr.replace(tokensRegex, `[$1$2$1 + ${label}]:`)
    fileStr = fileStr.replace(tokensRegex2, `$1$2$1 + ${label}`)
  }
}
