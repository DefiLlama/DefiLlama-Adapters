const { getLogs2 } = require('../helper/cache/getLogs')
const { getUniqueAddresses } = require('../helper/tokenMapping')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { queryContract } = require("../helper/chain/cosmos");
const CORE_ASSETS = require('../helper/coreAssets.json')

module.exports = {
  methodology: 'Total amount of BTC and eligible assets restaked on SatLayer.'
}

// Addresses related to SatLayer
const consts = {
  ETHEREUM_FACTORY: "0x42a856dbEBB97AbC1269EAB32f3bb40C15102819",
  BNB_FACTORY: "0x42a856dbEBB97AbC1269EAB32f3bb40C15102819",
  BITLAYER_FACTORY: "0x2E3c78576735802eD94e52B7e71830e9E44a9a1C",
  BERACHAIN_FACTORY: "0x50198b5E1330753F167F6e0544e4C8aF829BC99d",
  BABYLON_GENESIS_CBABY_HUB: "bbn1tng5u7fls4lyg356zkh2g32e80a286m8p2n0hqugc5467n9y6nksamehyj",
}

// TVL for EVM chains
const evmConfig = {
  ethereum: { factory: consts.ETHEREUM_FACTORY, fromBlock: 20564864 },
  bsc: { factory: consts.BNB_FACTORY, fromBlock: 42094094 },
  btr: { factory: consts.BITLAYER_FACTORY, fromBlock: 4532898 },
  berachain: { factory: consts.BERACHAIN_FACTORY, fromBlock: 262893 },
}

Object.keys(evmConfig).forEach(chain => {
  const { factory, fromBlock } = evmConfig[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs2({ api, factory, eventAbi: "event CapChanged(address token, uint256 cap)", fromBlock, })
      const tokens = getUniqueAddresses(logs.map(log => log.token))
      return sumTokens2({ api, owner: factory, tokens })
    }
  }
})

// TVL for Babylon Genesis (Cosmos SDK)
module.exports['babylon'] = {
  tvl: async (api) => {
    const data = await queryContract({ contract: consts.BABYLON_GENESIS_CBABY_HUB, chain: api.chain, data: { state: {} } });
    const total_native_token_balance = parseInt(data.total_staked_amount) + parseInt(data.unclaimed_unstaked_balance)
    const token = CORE_ASSETS.babylon.BABY
    api.add(token, total_native_token_balance)
    return api.getBalances()
  }
}