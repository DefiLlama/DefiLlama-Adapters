const inquirer = require('inquirer')
const childProcess = require('child_process')
inquirer.registerPrompt('fuzzypath', require('inquirer-fuzzy-path'))

const adapterPrompt = {
  type: 'fuzzypath',
  name: 'adapterPath',
  excludePath: nodePath => nodePath.startsWith('helper'),
  excludeFilter: nodePath => nodePath == '.',
  itemType: 'any',
  rootPath: 'projects',
  message: 'Select an adapter to run:',
  suggestOnly: false,
  depthLimit: 1,
}
const enableDebugPrompt = {
  type: 'confirm',
  name: 'debugMode',
  message: 'Enable Debug Mode:',
  default: false
}


async function run() {
  let adapterPath
  const { debugMode, ...response } = await inquirer.prompt([enableDebugPrompt, adapterPrompt])
  adapterPath = response.adapterPath

  while (true) {
    await runAdapter(adapterPath, debugMode)
    const answer = await inquirer.prompt([adapterPrompt])
    adapterPath = answer.adapterPath
  }
}

async function runAdapter(adapterPath, debugMode) {
  const env = {}
  if (debugMode)
    env.DEBUG_MODE_ENABLED = true
  const startTime = Date.now()
  return new Promise((resolve, reject) => {
    const env = {}

    if (debugMode)
      env.DEBUG_MODE_ENABLED = true

    const startTime = Date.now()

    const child = childProcess.fork('test.js', [adapterPath], {
      ...process.env,
      env,
    })

    child.on('error', reject)
    child.on('close', function (code) {
      console.log(`
      
      Run time: ${(Date.now() - startTime) / 1000} (seconds)
      
      `)
      resolve()
    })
  })
}

run()