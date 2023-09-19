const ADDRESSES = require('../helper/coreAssets.json')
const abi = require('./clayABIs/clayMain.json');

const clayAddresses = {
  clayMatic: "0x91730940DCE63a7C0501cEDfc31D9C28bcF5F905",
  clayEth: "0x331312DAbaf3d69138c047AaC278c9f9e0E8FFf8"
};

async function getTvlOnEthereum(_, block, _1, { api }) {
  const maticDeposits = await api.call({ target: clayAddresses.clayMatic, abi: abi.funds, })
  const ethDeposits = await api.call({ target: clayAddresses.clayEth, abi: abi.funds, })

  api.add(ADDRESSES.null, ethDeposits.currentDeposit)
  api.add(ADDRESSES.ethereum.MATIC, maticDeposits.currentDeposit)
}

module.exports = {
  ethereum: {
    tvl: getTvlOnEthereum,
  },
  methodology: `We get the total token deposited in clay contracts and convert it to USD.`
}