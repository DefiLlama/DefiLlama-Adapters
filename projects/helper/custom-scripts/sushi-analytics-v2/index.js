process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ', err);
})

const adaptersDir = '../../../'
const { bulky, hourlyRun } = require('./adapterMapping')
const { readFromElastic, writeToElastic } = require('./cache')
const sdk = require("@defillama/sdk");
const { PromisePool } = require('@supercharge/promise-pool')

function time() {
  return Math.round(Date.now() / 1e3);
}

const log = sdk.log
const error = console.error

async function updateProject({ tvlFunction, project, chain, tvlKey }) {
  const existingData = await readFromElastic({ tvlKey, timestamp: time(), range: 8 * 3600, project, throwIfMissing: false })
  if (existingData && !process.env.RUN_ONLY) {
    log('[skipped]', project, chain, 'data already exists in elastic')
    return;
  }

  const startTime = time()
  try {
    const timestamp = time()
    log('[start]', project, chain)
    const api = new sdk.ChainApi({ chain, timestamp: Math.floor(new Date() / 1e3), })
    api.timestamp = timestamp
    const balances = await tvlFunction(api, undefined, {}, { api, chain, storedKey: project })
    await writeToElastic({ project, tvlKey, chain, balances })

  } catch (e) {
    error(`Error updating project ${project} on chain ${chain}:`, e)
  }

  log('[done]', project, tvlKey, 'time taken: ', time() - startTime)
}

async function main() {
  const adapterKey = process.env.RUN_ONLY
  let items = []
  const allAdapterGroups = [...hourlyRun, ...bulky].flat()


  allAdapterGroups.flat().forEach(group => {
    Object.entries(group).forEach(([name, project]) => {
      if (adapterKey && name !== adapterKey) return;

      try {
        const projectModule = require(adaptersDir + project)

        Object.entries(projectModule).forEach(([chain, exports]) => {
          if (typeof exports !== 'object' || !exports || Array.isArray(exports)) return;
          Object.entries(exports).forEach(([exportKey, exported]) => {
            if (typeof exported === 'function') {
              items.push({ project: name, chain, tvlKey: `${chain}-${exportKey}`, tvlFunction: exported })
            }
          })
        })
      } catch (e) {
        console.error(`Error loading project ${name} at ${project}:`, e)
      }
    })
  })

  if (adapterKey) {
    items = items.filter(i => i.project === adapterKey)
  }

  // shuffle items
  items.sort(() => Math.random() - 0.5);

  await PromisePool.withConcurrency(7)
    .for(items).process(async (query) => {
      const startTime = time()
      log('[start]', query.project, query.chain, query.tvlKey)
      try {
        await updateProject(query)
      }
      catch (e) {
        console.error(e)
      }
      log('[done]', query.project, query.chain, query.tvlKey, 'time taken: ', time() - startTime)
    })
}

main().then(() => {
  console.log('Done, exiting...')
  process.exit(0)
})

// Function to exit the script
function exitScript() {
  console.log('Exiting script...');
  process.exit(0); // Exit with a status code of 0
}

// Schedule the script to exit after 3 hours
const durationInMinutes = 3 * 60; // 3 hours
const durationInMilliseconds = durationInMinutes * 60 * 1000;
console.log(`Will auto exit in ${durationInMinutes} minutes`);
setTimeout(exitScript, durationInMilliseconds);

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});