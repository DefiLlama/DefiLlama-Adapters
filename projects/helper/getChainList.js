const fs = require('fs')
const path = require('path')
/* 
const projectsFolder = path.join(__dirname, '..')

const files = fs.readdirSync(projectsFolder, { withFileTypes: true })
const whitelistedKeys = require('./whitelistedExportKeys.json')
const sdk = require('@defillama/sdk')

const projectNames = []
const rModules = []
const projectMissingChainNames = []
const keysCount = {}
const chainCount = {}


files.forEach(i => {
  if (['config', 'helper'].includes(i.name)) return;
  let fPath
  try {
    if (i.isFile()) {
      fPath = path.join(projectsFolder, i.name)
      rModules.push(getModule(fPath, i.name))
      projectNames.push(i.name)
      return;
    }
    fPath = path.join(projectsFolder, i.name, 'index.js')
    if (checkFileExistsSync(fPath)) {
      rModules.push(getModule(fPath, i.name))
      projectNames.push(i.name)
      return;
    }
    sdk.log('Adapter wrong? ', i.name)
  } catch (e) {
    // console.error(e)
    sdk.log('error in', i.name)
  }
})


function getModule(fPath, projectName) {
  let module = require(fPath)
  delete module.hallmarks
  if (typeof module.tvl === 'function') {
    const chainsWithTVL = Object.keys(module).filter(chain => typeof module[chain] === 'object' && typeof module[chain].tvl === 'function')
    if (chainsWithTVL.length) sdk.log('I am confused:', projectName, chainsWithTVL)
    else module.ethereum = { tvl: module.tvl }
    delete module.tvl
  }

  Object.keys(module).filter(k => typeof module[k] !== 'object')
    .forEach(i => {
      addKey(i, projectName)
      delete module[i]
    })

  Object.keys(module).forEach(chain => {
    Object.keys(module[chain]).forEach(key => addKey(key, `${projectName}-${chain}`))
  })
  return module
}

function addKey(key, label) {
  if (whitelistedKeys.includes(key)) return;
  if (!keysCount[key]) keysCount[key] = []
  keysCount[key].push(label)
}



rModules.forEach((module, i) => {
  if (!Object.keys(module).length) return projectMissingChainNames.push(projectNames[i])
  Object.keys(module).forEach(chain => {
    if (!chainCount[chain]) chainCount[chain] = []
    chainCount[chain].push(projectNames[i])
  })
})

const chainCountTable = Object.keys(chainCount).map((chain) => [chain, chainCount[chain].length, chainCount[chain]]).sort((a, b) => b[1] - a[1])
const keyCountTable = Object.keys(keysCount).map((key) => [key, keysCount[key].length, keysCount[key]]).sort((a, b) => b[1] - a[1])
console.table(chainCountTable)
console.table(keyCountTable)
const chainNames = chainCountTable.map(([chain]) => chain)

fs.writeFileSync(path.join(__dirname, 'chains.json'), JSON.stringify(chainNames, null, 2))

function checkFileExistsSync(filepath) {
  let flag = true;
  try {
    fs.accessSync(filepath, fs.constants.F_OK);
  } catch (e) {
    flag = false;
  }
  return flag;
}
 */

const chainNames = require('./chains.json')
chainNames.sort()
fs.writeFileSync(path.join(__dirname, './chains.json'), JSON.stringify(chainNames, null, 2))