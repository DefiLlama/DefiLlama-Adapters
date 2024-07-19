const ADDRESSES = require('../helper/coreAssets.json')
const abi = require('./clayABIs/clayMain.json');

const clayAddresses = {
  clayMatic: "0x91730940DCE63a7C0501cEDfc31D9C28bcF5F905",
};

async function getTvlOnEthereum(api) {
  const maticDeposits = await api.call({ target: clayAddresses.clayMatic, abi: abi.funds, })

  api.add(ADDRESSES.ethereum.MATIC, maticDeposits.currentDeposit)
}

module.exports = {
  ethereum: {
    tvl: getTvlOnEthereum,
  },
  methodology: `We get the total MATIC deposited in clay contracts and convert it to USD.`
}