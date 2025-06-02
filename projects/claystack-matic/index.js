const ADDRESSES = require('../helper/coreAssets.json')

const abis = {
  "funds": "function funds() view returns (uint256 currentDeposit, uint256 stakedDeposit, uint256 accruedFees)"
}

const clayAddresses = {
  clayMatic: "0x91730940DCE63a7C0501cEDfc31D9C28bcF5F905",
};

async function tvl(api) {
  const maticDeposits = await api.call({ target: clayAddresses.clayMatic, abi: abis.funds })
  api.add(ADDRESSES.ethereum.MATIC, maticDeposits.currentDeposit)
}

module.exports = {
  deadFrom: '2025-05-20',
  ethereum: { tvl },
  methodology: `We get the total MATIC deposited in clay contracts and convert it to USD.`
}