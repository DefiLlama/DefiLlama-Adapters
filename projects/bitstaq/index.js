const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/sumTokens')
const abi = require("./stmap.json");
const sdk = require("@defillama/sdk");

async function tvl(timestamp, block, chainBlocks) {
    const mapLockedAmount = await sdk.api.abi.call({
        target: "0x000000000000000000000000000000000000d011",
        abi: "function getAccountTotalLockedGold(address) external view returns (uint256)",
        chain: "map",
        block,
        params: ["0x2Ef75B32C26bC92977998C6D19e527E49fAD0D9B"],
    }).output;
    
    return {
        [`map:${ADDRESSES.map.WMAPO}`]:mapLockedAmount.output
    };
}


module.exports = {
  methodology: 'get the amount of token deposited in GOLD LOCKEDADDRESS on each supported chain.',
  tvl:{
    tvl,
  }
};

Object.keys(config).forEach(chain => {
  const { mosContract, tokens } = config[chain]
  module.exports[chain] = {
    tvl:sumTokensExport({ owner: mosContract, tokens: Object.values(tokens), logCalls: true })
  }
})