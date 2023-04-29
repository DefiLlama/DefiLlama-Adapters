const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking");
const { sumTokens2, nullAddress } = require("../helper/unwrapLPs");
const FACTORY_CONTRACT = "0x3B4b6B14d07A645005658E6Ea697edb0BD7bf2b1";

const LSD_LP = '0x3322f41dfa379B6D3050C1e271B0b435b3Ee3303'
const abis = {
  "getStakingTokens": "function getStakingTokens() view returns (address[])",
  "getStakingPoolAddress": "function getStakingPoolAddress(address) view returns (address)",
}

async function tvl(_, _1, _2, { api }) {
  const tokens = await api.call({ abi: abis.getStakingTokens, target: FACTORY_CONTRACT, })
  const owners = await api.multiCall({ abi: abis.getStakingPoolAddress, target: FACTORY_CONTRACT, calls: tokens })
  tokens.forEach((v, i) => {
    if (v === nullAddress) {
      tokens.push(ADDRESSES.ethereum.WETH)
      owners.push(owners[i])
    }
  })
  return sumTokens2({ api, tokensAndOwners2: [tokens, owners], blacklistedTokens: [LSD_LP] })
}

module.exports = {
  start: 16831303,
  ethereum: {
    tvl,
    staking: staking('0x1D31755E03119311c7F00ae107874dddEC7573f3', LSD_LP)
  }
};
