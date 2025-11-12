const inquirer = require('inquirer')
const childProcess = require('child_process')
inquirer.registerPrompt('fuzzypath', require('inquirer-fuzzy-path'))

// Load environment variables before changing directories
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })

console.log('Starting directory: ' + process.cwd());
const args = process.argv.slice(2); // The first two elements are 'node' and the script filename

const NEW_DIR = './projects/' + (args[0] ?? '')

try {
  process.chdir(NEW_DIR);
  console.log('New directory: ' + process.cwd());
}
catch (err) {
  console.log('chdir: ' + err);
}


const adapterPrompt = {
  type: 'fuzzypath',
  name: 'adapterPath',
  excludePath: nodePath => nodePath.startsWith('helper'),
  excludeFilter: nodePath => nodePath == '.',
  itemType: 'any',
  rootPath: '.',
  message: 'Select an adapter to run:',
  suggestOnly: false,
  depthLimit: 0,
}

async function run() {
  let adapterPath
  const { debugMode, ...response } = await inquirer.prompt([
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
      ...process.env,
      LLAMA_SDK_MAX_PARALLEL: 100,
      LLAMA_DEBUG_MODE: !!debugMode
    }

    const startTime = Date.now()

    const child = childProcess.fork(__dirname +'/../test.js', [adapterPath], {
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