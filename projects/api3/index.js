const sdk = require('@defillama/sdk');
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getCuratorExport } = require("../helper/curators");

const api3_token = '0x0b38210ea11411557c13457d4da7dc6ea731b88a'
const api3_dao_pool = '0x6dd655f10d4b9e242ae186d9050b68f725c76d76'
const api3CirculatingSupply = "0xcD34bC5B03C954268d27c9Bc165a623c318bD0a8"

const configs = {
  blockchains: {
    ethereum: {
      morphoVaultOwners: [
        '0x9f0566F2E8Ff51901DD0C0E7aad937A94931f75C',
        '0x5a9AA3219dD1cBEF6A18Fd221464E071DF2677c2'
      ]
    }
  }
}

const stakingTVL = async (api) => {
  const balances = {}
  const locked_and_vested = await api.call({
    target: api3CirculatingSupply,
    abi: "uint256:getLockedVestings",
  })

  sdk.util.sumSingleBalance(balances,api3_token,locked_and_vested * -1, api.chain)
  return sumTokens2({ owner: api3_dao_pool, tokens: [api3_token], balances, api })
}

module.exports = {
  ethereum: {
    staking: stakingTVL, // tvl / staking
    tvl: getCuratorExport(configs).ethereum.tvl,
  },
  methodology: 'Api3 TVL is all Api3 token staked in the Api3 DAO Pool contract and all assets that are deposited in all vaults curated by Api3.',
}
