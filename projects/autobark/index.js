const { yieldHelper } = require("../helper/unknownTokens");
const { get } = require('../helper/http')

const chain = "dogechain";
const tokenAPI = {
  "type": "function",
  "stateMutability": "view",
  "outputs": [
    {
      "type": "address",
      "name": "",
      "internalType": "contract IERC20"
    }
  ],
  "name": "want",
  "inputs": []
}

module.exports = {
  [chain]: {
    tvl: async (_, _b, { [chain]: block }) => {
      const pools = await get('https://raw.githubusercontent.com/autobark-finance/autobark-app-pub/main/src/features/config/vault/dogechain_pools.js')
      const vaults = pools
        .split('\n')
        .filter(i => i.includes('earnedTokenAddress'))
        .map(i => i.split('\'').filter(i => i.startsWith('0x'))[0])
      return yieldHelper({ vaults, chain, block, tokenAPI, useDefaultCoreAssets: true, })
    }
  }
}