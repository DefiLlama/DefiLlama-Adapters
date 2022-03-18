const fs = require('fs')
const path = require('path')

const projectsFolder = path.join(__dirname, '..')

const files = fs.readdirSync(projectsFolder, { withFileTypes: true })

const projectNames = []
const rModules = []
const projectMissingChainNames = []
const projectMissingTVLFunction = []

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
    console.log('Adapter wrong? ', i.name)
  } catch (e) {
    // console.error(e)
    console.log('error in', i.name)
  }
})

function getModule(fPath, projectName) {
  let module = require(fPath)
  if (typeof module.tvl === 'function') {
    projectMissingTVLFunction.push(projectName)
    if (module.ethereum)  console.log('I am confused:', projectName)
    else module.ethereum = module.tvl
    delete module.tvl
  }
  Object.keys(module).filter(k => typeof module[k] !== 'object')
    .forEach(i => delete module[i])
  return module
}


const chainCount = {}

rModules.forEach((module, i) => {
  if (!Object.keys(module).length) return projectMissingChainNames.push(projectNames[i])
  if (Object.keys(module).some(chain => !module[chain].tvl)) return projectMissingTVLFunction.push(projectNames[i])
  Object.keys(module).forEach(chain => {
    if (!chainCount[chain]) chainCount[chain] = []
    chainCount[chain].push(chain)
  })
})

console.log(`projectMissingChainNames count: `, projectMissingChainNames.length)
console.log(`projectMissingTVLFunction count: `, projectMissingTVLFunction.length, projectMissingTVLFunction)
console.log(`Chain count: `, Object.keys(chainCount).length)
const chainCountTable = Object.keys(chainCount).map((chain) => [chain, chainCount[chain].length, chainCount[chain]]).sort((a, b) => b[1] - a[1])
console.table(chainCountTable)

function checkFileExistsSync(filepath) {
  let flag = true;
  try {
    fs.accessSync(filepath, fs.constants.F_OK);
  } catch (e) {
    flag = false;
  }
  return flag;
}