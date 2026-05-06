const ADDRESSES = require('../helper/coreAssets.json')
const feedContract = '0xFbb53aa72c10680e822e255aC70D10f8bb957D64'

async function tvl(api) {
  const [supply, withheld] = await Promise.all([
    api.call({ abi: 'uint256:getPlumeStakedAmount', target: feedContract, }),
    api.call({ abi: 'uint256:getCurrentWithheldETH', target: feedContract, })
  ]);
  api.add(ADDRESSES.null, supply)
  api.add(ADDRESSES.null, withheld)
}

module.exports = {
  methodology: 'Retrieve the total amount of PLUME staked via the Plume feed contract and current withheld ETH (insurance/withheld fund for instant withdrawals) to track underlying collateral.',
  plume_mainnet: {
    tvl
  }
}
