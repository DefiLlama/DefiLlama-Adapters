const ADDRESSES = require('../helper/coreAssets.json')

const abis = {
  "funds": "function funds() view returns (uint256 currentDeposit, uint256 stakedDeposit, uint256 accruedFees)"
}

const clayAddresses = {
  clayEth: "0x331312DAbaf3d69138c047AaC278c9f9e0E8FFf8"
};

async function tvl(api) {
  const ethDeposits = await api.call({ target: clayAddresses.clayEth, abi: abis.funds, })
  api.add(ADDRESSES.null, ethDeposits.currentDeposit)
}

module.exports = {
  deadFrom: '2025-05-20',
  doublecounted: true,
  hallmarks: [[1707315338,"Split Adapter"]],
  ethereum: { tvl },
  methodology: `We get the total ETH deposited in clay contracts and convert it to USD.`
}