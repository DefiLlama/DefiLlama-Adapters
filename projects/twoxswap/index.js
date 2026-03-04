const ADDRESSES = require('../helper/coreAssets.json')

const X2Pool = '0x2a315Fef86916B30905086C85A9cB55E5DCD7ED3'

async function tvl(api) {
  const totalAssets = await api.call({ target: X2Pool, abi: 'uint256:totalAssets' })
  api.add(ADDRESSES.ethereum.USDC, totalAssets)
}

module.exports = {
  methodology: 'TVL is the total USDC deposited in the X2Pool ERC-4626 vault, measured via totalAssets().',
  ethereum: { tvl },
}
