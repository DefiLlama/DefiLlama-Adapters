const USDC = '0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4'

async function tvl(api) {
  const assetManagerUSDC = await api.call({ abi: 'uint256:assetManagerUSDC', target: treasury })
  api.add(USDC, assetManagerUSDC)
}

module.exports = {
  scroll: { tvl }
}
