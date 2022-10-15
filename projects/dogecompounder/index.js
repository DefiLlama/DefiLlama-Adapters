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
      const pools = await get('https://raw.githubusercontent.com/DogeCompounder/DogeCompounderApi/main/doge_vaults.json');
      const vaults = [];
      for(var i = 0; i < pools.length; i++){
        vaults.push(pools[i].earnedTokenAddress);
      }
      return yieldHelper({ vaults, chain, block, tokenAPI, useDefaultCoreAssets: true, })
    }
  }
}