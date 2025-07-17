const ADDRESSES = require('../helper/coreAssets.json');
const sdk = require('@defillama/sdk')

const lronContract = ADDRESSES.ronin.LRON;

async function lron(timestamp, ethBlock, {ronin:block}) {
  const stakedRon = await sdk.api.abi.call({
    block,
    chain : "ronin",
    target: lronContract,
    abi: "uint256:totalAssets"
  })

  return {
    "ronin" : Number(stakedRon.output)/1e18,
  }
}

module.exports = {
  ronin: {
    tvl: lron
  },
}