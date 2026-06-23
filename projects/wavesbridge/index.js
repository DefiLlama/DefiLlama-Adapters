const ADDRESSES = require('../helper/coreAssets.json')
const solana = require('../helper/solana');
const waves = require("../helper/chain/waves");
const { sumTokens2, } = require('../helper/unwrapLPs');

const data = {
  bsc: {
    contractAddress: "0x3AC7A6635d99F376c3c05442f7Eef62d349C3A55",
    tokens: ["0xbA2aE424d960c26247Dd6c32edC70B295c744C43", "0x873CD8702d18Eb584CCdFFc10a5B88d62606cEEF",]
  },
  ethereum: {
    contractAddress: "0x3AC7A6635d99F376c3c05442f7Eef62d349C3A55",
    tokens: ["0x1a920b0eaE5B49c51eBf042a61c3Fa58Dae04882", ADDRESSES.ethereum.INU, "0x6982508145454Ce325dDbE47a25d4ec3d2311933", "0x4d224452801ACEd8B2F0aebE155379bb5D594381", "0x812Ba41e071C7b7fA4EBcFB62dF5F45f6fA853Ee", ADDRESSES.ethereum.USDT,]
  },
  unit0: {
    contractAddress: "0x3AC7A6635d99F376c3c05442f7Eef62d349C3A55",
    tokens: [ADDRESSES.unit0.USDC, ADDRESSES.unit0.USDT, ADDRESSES.unit0.WETH, ADDRESSES.unit0.WBTC,]
  },
}

async function tvl(api) {
  const { contractAddress: owner, tokens } = data[api.chain];
  return sumTokens2({ api, owner, tokens })
}

async function solanaTvl() {
  return solana.sumTokens2({ owner: '8eQ7p6cBh57pESr6oHT6PS9GtdLQdJVYebeCytf9mufe' })
}

async function wavesTvl(api) {
  return waves.sumTokens({ owners: ['3P6Rk2XBo6MJm9seLfxvJ1VSGz54yWiYb9U'], api })
}

module.exports = {
  methodology: "All tokens locked in WavesBridge smart contracts.",
  timetravel: false,
  waves: {
    tvl: wavesTvl,
  },
  solana: {
    tvl: solanaTvl,
  },
}

Object.keys(data).forEach(chain => {
  module.exports[chain] = { tvl }
})
