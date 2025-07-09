const fs = require('fs');
const path = require('path');
const compactStringify = require('../utils/compactStringify.js');
const unknownTokens = require('../projects/helper/unknownTokens.js');
const uniswapV3 = require('../projects/helper/uniswapV3.js');
const { staking } = require('../projects/helper/staking')
const { pool2 } = require('../projects/helper/pool2')

const rootLevelKeySet = new Set([
  "methodology",
  "misrepresentedTokens",
  "timetravel",
  "start",
  "doublecounted",
  "hallmarks",
  "isHeavyProtocol",
  "deadFrom",
])


function moduleToImportKey(str) {
  if (str.endsWith('.js')) {
    str = str.slice(0, -3)
  }
  if (str.endsWith('/index')) {
    str = str.slice(0, -6)
  }
  return str
}

function deleteAdapterFile(filePath) {
  if (filePath.endsWith('.js')) {
    if (filePath.endsWith('index.js')) {
      const dir = path.dirname(filePath);
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    } else {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  } else if (fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory()) {
    fs.rmSync(filePath, { recursive: true, force: true });
  }
}


function getAllAdapters(dir = path.join(__dirname, '..', 'projects')) {

  const adapters = {};
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const relativePath = path.relative(dir + '/..', file)
    try {
      const filePath = path.join(dir, file);
      if (fs.lstatSync(filePath).isDirectory()) {
        const indexFile = path.join(filePath, 'index.js');
        if (fs.existsSync(indexFile)) {
          adapters[moduleToImportKey(relativePath)] = require(indexFile);
        }
      } else if (file.endsWith('.js')) {
        adapters[moduleToImportKey(relativePath)] = require(filePath);
      }
    } catch (error) {
      if (error.message?.includes("Cannot find module '@multiversx/sdk-core/out'")) return;
      if (error.message?.includes("Cannot find module './helper/heroku-api'")) return;
      console.error(`Error loading adapter from ${file}:`, error.message ? error.message : error);
    }
  });

  return adapters;
}

function sortJSONByKeyAndStoreFile(json, filename) {
  const sortedKeys = Object.keys(json).sort();
  const filePath = path.join(__dirname, filename + '.json');
  const sortedJson = {};
  sortedKeys.forEach(key => {
    sortedJson[key] = json[key];
  });
  fs.writeFileSync(filePath, compactStringify(sortedJson, { maxLength: 153 }));
}

function readJSONFile(filename) {
  const filePath = path.join(__dirname, filename + '.json');
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  }
  return {};
}


//Replace all fuctions with mock functions in an object all the way down
function mockFunctions(obj) {
  if (typeof obj === "function") {
    return 'lMTF' // llamaMockedTVLFunction
  } else if (typeof obj === "object") {
    Object.keys(obj).forEach((key) => obj[key] = mockFunctions(obj[key]))
  }
  return obj
}

function unMockFunctions(obj) {
  if (typeof obj === "string" && obj === 'lMTF') {
    return () => { throw new Error('This function has been mocked and should not be called') }
  } else if (typeof obj === "object") {
    Object.keys(obj).forEach((key) => obj[key] = unMockFunctions(obj[key]))
  }
  return obj
}

function moduleBuildFunctionWrapper(functionName) {
  return (...args) => ({
    functionName,
    args,
    mockLlamaBuilderFunction: true,
  })
}

const functionsConfig = {
  'uniTvlExports': { module: unknownTokens, },
  'uniTvlExport': { module: unknownTokens, },
  'uniV3Export': { module: uniswapV3, },
}

Object.entries(functionsConfig).forEach(([key, value]) => value.config = readJSONFile(key)); // load all config files


function getModuleFromConfig(config, configKey) {
  const { functionName, args, staking: stakingConfig, pool2: pool2Config, ...rest } = config;

  if (!functionName || !functionsConfig[functionName]) {
    console.warn(`Function ${functionName} is not defined, skipping ${configKey}...`);
    return;
  }

  let responseObject = functionsConfig[functionName]
  if (typeof stakingConfig === 'object' && Object.keys(stakingConfig).length > 0) {
    Object.keys(stakingConfig).forEach((chain) => {
      if (!responseObject[chain])
        responseObject[chain] = {};
      responseObject[chain].staking = staking(...stakingConfig[chain]);
    })
    responseObject = { ...responseObject, staking: stakingConfig };
  }
  if (typeof pool2Config === 'object' && Object.keys(pool2Config).length > 0) {
    Object.keys(pool2Config).forEach((chain) => {
      if (!responseObject[chain])
        responseObject[chain] = {};
      responseObject[chain].pool2 = pool2(...pool2Config[chain]);
    })
  }

  responseObject = { ...responseObject, ...rest };
  return responseObject
}

module.exports = {
  moduleToImportKey,
  deleteAdapterFile,
  getAllAdapters,
  sortJSONByKeyAndStoreFile,
  mockFunctions,
  unMockFunctions,
  getModuleFromConfig,
  functionsConfig,
  readJSONFile,
  moduleBuildFunctionWrapper,
  rootLevelKeySet,
}

