const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  methodology: "Counts NEST tokens that have been staked in the nest dapp",
};


const config = {
  ethereum: {
    tvlContracts: ['0xE544cF993C7d477C7ef8E91D28aCA250D135aa03'],
    tokens: [
      "0x0316EB71485b0Ab14103307bf65a021042c6d380"
    ],
    NEST: '0x04abEdA201850aC0124161F037Efd70c74ddC74C',
    stakingContracts: [
      "0xaA7A74a46EFE0C58FBfDf5c43Da30216a8aa84eC",
      "0x505eFcC134552e34ec67633D1254704B09584227",
      "0x9a5C88aC0F209F284E35b4306710fEf83b8f9723",
      "0x34B931C7e5Dc45dDc9098A1f588A0EA0dA45025D",
      "0xE544cF993C7d477C7ef8E91D28aCA250D135aa03"
    ]
  },
  bsc: {
    tvlContracts: ['0x9484f12044b9d5707AfeaC5BD02b5E0214381801'],
    tokens: [
      ADDRESSES.bsc.USDT
    ],
    NEST: '0x98f8669F6481EbB341B522fCD3663f79A3d1A6A7',
    stakingContracts: ["0x09CE0e021195BA2c1CDE62A8B187abf810951540"]
  },
  polygon: {
    NEST: '0x98f8669F6481EbB341B522fCD3663f79A3d1A6A7',
    stakingContracts: ["0x09CE0e021195BA2c1CDE62A8B187abf810951540"]
  },
  kcc: {
    NEST: '0x98f8669F6481EbB341B522fCD3663f79A3d1A6A7',
    stakingContracts: ["0x7DBe94A4D6530F411A1E7337c7eb84185c4396e6"]
  },
}

Object.keys(config).forEach(chain => {
  const { NEST: token, stakingContracts = [], tokens = [], tvlContracts = [] } = config[chain]
  module.exports[chain] = {
    tvl: sumTokensExport({ tokens, owners: tvlContracts }),
    staking: token ? sumTokensExport({ token, owners: stakingContracts }) : undefined,
  }
})