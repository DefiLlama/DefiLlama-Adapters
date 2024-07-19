const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking");
const { sumTokens2, nullAddress } = require("../helper/unwrapLPs");
const FACTORY_CONTRACT = "0x3B4b6B14d07A645005658E6Ea697edb0BD7bf2b1";

const ETHx = '0x21ead867c8c5181854f6f8ce71f75b173d2bc16a'
const LSD = '0xfac77a24e52b463ba9857d6b758ba41ae20e31ff'
const LSD_LPs = ['0x3322f41dfa379B6D3050C1e271B0b435b3Ee3303', '0x3ab2ebbe52f4a80098a461cf9ecdade2ed645fc4']
const abis = {
  "getStakingTokens": "function getStakingTokens() view returns (address[])",
  "getStakingPoolAddress": "function getStakingPoolAddress(address) view returns (address)",
}

async function tvl(api) {
  const tokens = await api.call({ abi: abis.getStakingTokens, target: FACTORY_CONTRACT, })
  const owners = await api.multiCall({ abi: abis.getStakingPoolAddress, target: FACTORY_CONTRACT, calls: tokens })
  tokens.forEach((v, i) => {
    if (v === nullAddress) {
      tokens.push(ADDRESSES.ethereum.WETH)
      owners.push(owners[i])
    }
  })
  return sumTokens2({ api, tokensAndOwners2: [tokens, owners], blacklistedTokens: [...LSD_LPs, ETHx, LSD] })
}

module.exports = {
  start: 16831303,
  ethereum: {
    tvl,
    pool2: staking(['0x1D31755E03119311c7F00ae107874dddEC7573f3', '0xE05630Da82604591F002b61F7116429CfDC4B542'], LSD_LPs),
    staking: staking(['0xcA73C2aBA8EECb37EA1648999A7b08787b808ee2'], ETHx),
  }
};
