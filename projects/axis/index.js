// Axis — https://axis.to
// TVL = circulating USDx on Ethereum V2. Do not add sUSDx or Origin (double count).
const USDX = '0xa1fA7777974312f7d801A8880714a218F76233f8'

async function tvl(api) {
  const supply = await api.call({
    target: USDX,
    abi: 'uint256:totalSupply',
  })
  api.add(USDX, supply)
}

module.exports = {
  methodology: 'Supply of USDx on Ethereum. sUSDx is an ERC-4626 vault of USDx and is excluded to avoid double counting. The Upshift Origin Vault is excluded because it is already counted under Upshift.',
  ethereum: { tvl },
}
