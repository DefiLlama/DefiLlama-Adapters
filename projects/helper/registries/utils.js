const whitelistedExportKeys = require('../whitelistedExportKeys.json')
const { staking: stakingFn } = require('../staking')
const { pool2: pool2Fn } = require('../pool2')

const topLevelKeys = new Set(whitelistedExportKeys)
const chainExportKeys = new Set(['tvl', 'staking', 'pool2', 'borrowed', 'vesting'])

const convertors = {
  staking: (params) => stakingFn(...params),
  pool2: (params) => pool2Fn(...params),
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
