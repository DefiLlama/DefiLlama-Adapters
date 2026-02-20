const whitelistedExportKeys = require('../projects/helper/whitelistedExportKeys.json')
const { staking: stakingFn } = require('../projects/helper/staking')
const { pool2: pool2Fn } = require('../projects/helper/pool2')
const { staking: stakingUnknownFn } = require('../projects/helper/unknownTokens')

const topLevelKeys = new Set(whitelistedExportKeys)
const chainExportKeys = new Set(['tvl', 'staking', 'pool2', 'borrowed', 'vesting', 'hallmarks'])

// Array params: staking: [owner, token] → stakingFn(owner, token)
const convertors = {
  staking: (params) => stakingFn(...params),
  pool2: (params) => pool2Fn(...params),
  vesting: (params) => stakingFn(...params),
}

// Object params: staking: { owner, tokens, lps, ... } → unknownTokens staking
const objectConvertors = {
  staking: (obj) => stakingUnknownFn(obj),
}

function buildProtocolExports(configs, exportFn) {
  const protocols = {}
  Object.entries(configs).forEach(([name, entry]) => {
    const topLevel = {}
    const chainConfigs = {}

    let options = {}

    Object.entries(entry).forEach(([key, value]) => {
      if (topLevelKeys.has(key)) {
        topLevel[key] = value
      } else if (key === '_options') {
        options = value
      } else {
        chainConfigs[key] = value
      }
    })

    const result = exportFn(chainConfigs, options)

    // extract chain-level extras (staking, pool2, etc.) from chain configs
    Object.entries(chainConfigs).forEach(([chain, chainConfig]) => {
      if (typeof chainConfig === 'object' && chainConfig !== null && result[chain]) {
        for (const key of chainExportKeys) {
          if (key in chainConfig) {
            const value = chainConfig[key]
            if (Array.isArray(value) && convertors[key]) {
              result[chain][key] = convertors[key](value)
            } else if (typeof value === 'object' && value !== null && !Array.isArray(value) && objectConvertors[key]) {
              result[chain][key] = objectConvertors[key](value)
            } else {
              result[chain][key] = value
            }
          }
        }
      }
    })

    Object.assign(result, topLevel)
    protocols[name] = result
  })
  return protocols
}

module.exports = { buildProtocolExports }
