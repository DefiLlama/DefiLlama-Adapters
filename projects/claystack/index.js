const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const abi = require('./clayABIs/clayMain.json');

const clayAddresses = {
  clayMatic: "0x91730940DCE63a7C0501cEDfc31D9C28bcF5F905",
  clayEth: "0x331312DAbaf3d69138c047AaC278c9f9e0E8FFf8"
};

const coinAddresses = {
  matic: ADDRESSES.ethereum.MATIC,
};

async function getClayTvlOnEthereum(_, block) {
  const maticDeposits = (
    await sdk.api.abi.call({
      target: clayAddresses.clayMatic,
      abi: abi.funds,
      chain: "ethereum",
      block
    })
  ).output;

  const ethDeposits = (
    await sdk.api.abi.call({
      target: clayAddresses.clayEth,
      abi: abi.funds,
      chain: "ethereum",
      block
    })
  ).output;

  return {
    [ADDRESSES.null]: ethDeposits.currentDeposit,
    [coinAddresses.matic]: maticDeposits.currentDeposit
  };
}

module.exports = {

  ethereum: {
    tvl: getClayTvlOnEthereum,
  },
  methodology: `We get the total token deposited in clay contracts and convert it to USD.`
}