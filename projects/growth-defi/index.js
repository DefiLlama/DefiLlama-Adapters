const sdk = require('@defillama/sdk');
const abi = require('./abi.json');

const WHEAT = '0x3ab63309f85df5d4c3351ff8eacb87980e05da4e';
const MOR = '0x87bade473ea0513d4aa7085484aeaa6cb6ebe7e3';

function getBSCAddress(address) {
  return `bsc:${address}`
}

async function tvl(timestamp, block) {
    let balances = {};

    const wheatTVL = await sdk.api.abi.call({
      target: WHEAT,
      abi: abi['totalSupply'],
      block: block,
      chain: "bsc",
    });

    const morTVL = await sdk.api.abi.call({
      target: MOR,
      abi: abi['totalSupply'],
      block: block,
      chain: "bsc",
    });

    balances[getBSCAddress(WHEAT)] = wheatTVL.output;
    balances[getBSCAddress(MOR)] = morTVL.output;
    return balances;
}

module.exports = {
  bsc: {
    tvl
  },
  tvl,
}
