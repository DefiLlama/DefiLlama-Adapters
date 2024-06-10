const ADDRESSES = require('../helper/coreAssets.json')
const abi = require('./clayABIs/clayMain.json');

const clayAddresses = {
  clayEth: "0x331312DAbaf3d69138c047AaC278c9f9e0E8FFf8"
};

async function getTvlOnEthereum(api) {
  const ethDeposits = await api.call({ target: clayAddresses.clayEth, abi: abi.funds, })

  api.add(ADDRESSES.null, ethDeposits.currentDeposit)
}

module.exports = {
  doublecounted: true,
  hallmarks: [
    [1707315338,"Split Adapter"]
  ],
  ethereum: {
    tvl: getTvlOnEthereum,
  },
  methodology: `We get the total ETH deposited in clay contracts and convert it to USD.`
}