const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const abi = require('./clayABIs/clayMain.json');

const clayAddresses = {
  clayMatic: "0x91730940DCE63a7C0501cEDfc31D9C28bcF5F905",
};

const coinAddresses = {
  matic: ADDRESSES.ethereum.MATIC,
};

async function getClayMaticTvl(_,block) {
  const deposits = (
    await sdk.api.abi.call({
      target: clayAddresses.clayMatic,
      abi: abi.funds,
      chain: "ethereum",
      block
    })
  ).output;
  return { [coinAddresses.matic]: deposits.currentDeposit };
}

module.exports = {

  ethereum: {
    tvl: getClayMaticTvl,
  },
  methodology: `We get the total token deposited in clay contracts and convert it to USD.`
}