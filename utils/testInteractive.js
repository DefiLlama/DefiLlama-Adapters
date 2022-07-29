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
  depthLimit: 0,
}
const enableDebugPrompt = {
  type: 'confirm',
  name: 'debugMode',
  message: 'Enable Debug Mode:',
  default: false
}


async function run() {
  let adapterPath
  const { debugMode, ...response } = await inquirer.prompt([
    // enableDebugPrompt, 
    adapterPrompt,
  ])
  adapterPath = response.adapterPath

  while (true) {
    adapterPrompt.default = adapterPath
    await runAdapter(adapterPath, true)
    const answer = await inquirer.prompt([adapterPrompt])
    adapterPath = answer.adapterPath
  }
}

async function runAdapter(adapterPath, debugMode) {
  const startTime = Date.now()
  return new Promise((resolve, reject) => {
    const env = {
      LLAMA_SDK_MAX_PARALLEL: 100,
      LLAMA_DEBUG_MODE: !!debugMode
    }

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