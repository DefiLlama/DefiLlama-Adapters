const sdk = require("@defillama/sdk");
const ADDRESSES = require('../helper/coreAssets.json')
const STAKING_CONTRACT = '0x0000000000000000000000000000000000001000';

async function tvl(api) {
  const {output: balance} = await sdk.api.eth.getBalance({
    target: STAKING_CONTRACT,
    block: api.block,
    chain: "chz"
  });
  api.add(ADDRESSES.null, balance)
}

module.exports = {
  methodology: 'Total CHZ Locked in Staking System Contract.',
  chz: {
    tvl,
  }
}; 

