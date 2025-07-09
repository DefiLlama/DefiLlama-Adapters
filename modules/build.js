
function moduleBuildFunctionWrapper(functionName) {
  return (...args) => ({
    functionName,
    args,
    mockLlamaBuilderFunction: true,
  })
}

const uniswapV2Helper = require('../projects/helper/cache/uniswap.js');
uniswapV2Helper.getUniTVL = moduleBuildFunctionWrapper('getUniTVL')
const unknownTokens = require('../projects/helper/unknownTokens.js');

const staking = require('../projects/helper/staking')
const pool2 = require('../projects/helper/pool2')
staking.staking = moduleBuildFunctionWrapper('staking')
pool2.pool2 = moduleBuildFunctionWrapper('pool2')
unknownTokens.getUnknownTokens = uniswapV2Helper.getUniTVL


const {
  getAllAdapters,
  sortJSONByKeyAndStoreFile,
  functionsConfig,
  rootLevelKeySet,
} = require('./util.js');
// mock all helper functions
Object.entries(functionsConfig).forEach(([key, value]) => {
  value.module[key] = moduleBuildFunctionWrapper(key);
});

function addRootLevelConfig({ moduleConfig, key, rest, }) {
  let skipModule = false;

  Object.keys(rest).forEach((rootKey) => {
    if (rootLevelKeySet.has(rootKey)) {
      moduleConfig[rootKey] = rest[rootKey];
      return;
    }

    // else it is a chain specific key
    if (typeof rest[rootKey] !== 'object') {
      console.warn(`${key} chain config ${rootKey} is not an object, skipping ${key}...`);
      skipModule = true
      return;
    }

    Object.entries(rest[rootKey]).forEach(([tvlKey, tvlFunction]) => {
      if (skipModule) return;
      if (tvlKey === 'tvl' || !tvlFunction) return;
      if (typeof tvlFunction !== 'object' || !tvlFunction.mockLlamaBuilderFunction) {
        console.warn(`${key} Chain specific key ${rootKey}-${tvlKey} is not mocked function, skipping ${key}...`);
        skipModule = true
        return;
      }
      if (tvlFunction.functionName === 'staking' && tvlKey === 'staking') {
        moduleConfig.staking = moduleConfig.staking || {}
        moduleConfig.staking[rootKey] = tvlFunction.args
        return;
      }

      if (tvlFunction.functionName === 'pool2' && tvlKey === 'pool2') {
        moduleConfig.pool2 = moduleConfig.pool2 || {}
        moduleConfig.pool2[rootKey] = tvlFunction.args
        return;
      }

      console.warn(`${key} Chain specific key ${rootKey}-${tvlKey} is not supported, skipping ${key}...`);
      skipModule = true;
      return;
    });
  });

  return skipModule;
}

const allAdadpters = getAllAdapters()
let count = {}
let allCount = 0;

Object.entries(allAdadpters).forEach(([key, value]) => {
  const { mockLlamaBuilderFunction, args, functionName, ...rest } = value;
  if (!mockLlamaBuilderFunction || !functionName || !functionsConfig[functionName]) {
    // console.warn(`Function ${functionName} is not mocked, skipping ${key}...`);
    addGuniTvlModule(key, value);
    return;
  }

  if (!args || !Array.isArray(args)) {
    console.warn(`${key} chain config args is not an array, skipping ${key}...`);
    return;
  }

  const moduleConfig = { args, }

  let skipModule = addRootLevelConfig({ moduleConfig, key, rest });

  if (skipModule) return;
  functionsConfig[functionName].config[key] = moduleConfig

  addCount(functionName);
})

function addGuniTvlModule(key, value) {
  const adapterName = key
  const chainConfigs = getChainConfigs(value)
  const hasOnlyUniTvlExports = chainConfigs.every(([_, config]) => {
    if (!config.tvl) return true;
    if (typeof config.tvl !== 'object' || !config.tvl.mockLlamaBuilderFunction || config.tvl.functionName !== 'getUniTVL') return false;
    return true;
  });

  if (!hasOnlyUniTvlExports) return;
  const factoryConfig = {}
  let commonConfig
  let skipModule = false;

  chainConfigs.forEach(([chain, config]) => {
    if (!config.tvl) return;
    if (skipModule) return;
    const { factory, chain: _chain, useDefaultCoreAssets, ...restConfig } = config.tvl.args[0];
    factoryConfig[chain] = factory;
    if (!commonConfig) commonConfig = { ...restConfig };
    else {
      Object.entries(restConfig).forEach(([key, value]) => {
        if (skipModule) return;
        if (!commonConfig.hasOwnProperty(key)) {
          commonConfig[key] = value;
          return;
        }
        if (commonConfig[key] !== value) {
          console.warn(`${adapterName} Chain ${chain} config for ${key} does not match common config, skipping ${key}...`);
          skipModule = true;
        }
      });
    }

    if (useDefaultCoreAssets === false)
      commonConfig.useDefaultCoreAssets = false;
  })

  if (skipModule || Object.keys(factoryConfig).length === 0) return;


  const moduleConfig = { functionName: 'uniTvlExports', args: [factoryConfig, commonConfig], }
  skipModule = addRootLevelConfig({ moduleConfig, key, rest: value });
  if (skipModule) return;
  functionsConfig['uniTvlExports'].config[key] = moduleConfig;
  addCount('getUniTVL');
}


if (allCount) {
  console.log(`Found ${allCount} adapters using uniTvlExports/uniTvlExport.`);
}
else
  process.exit(0);

console.table(count);


Object.entries(functionsConfig).forEach(([key, value]) => {
  sortJSONByKeyAndStoreFile(value.config, key)
});


function getChainConfigs(value) {
  return Object.entries(value).filter(([key]) => !rootLevelKeySet.has(key));
}

function addCount(functionName) {
  allCount++;
  count[functionName] = count[functionName] || 0;
  count[functionName]++;
}