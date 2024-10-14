const agETH = '0xe1b4d34e8754600962cd944b535180bd758e6c2e'
const vaults = [agETH]

async function tvl(api) {
  const tokens = await api.multiCall({ abi: 'address:asset', calls: vaults })
  const bals = await api.multiCall({ abi: 'uint256:totalAssets', calls: vaults })
  api.addTokens(tokens, bals)
}

module.exports = {
  doublecounted: true,
  methodology: "TVL corresponds to the sum of rsETH from all active loans managed by the pool and the rsETH balance held within the pool.",
  ethereum: {
    tvl,
  },
};





