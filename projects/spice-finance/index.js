const vaults = [
  '0xAe11ae7CaD244dD1d321Ff2989543bCd8a6Db6DF', // Flagship
  '0xd68871bd7D28572860b2E0Ee5c713b64445104F9', // Leverage
  '0x6110d61DD1133b0f845f1025d6678Cd22A11a2fe', // VIP
  '0xfC287513E2DD58fbf952eB0ED05D511591a6215B', // Blur
]

async function tvl(api) {
  const tokens = await api.multiCall({ abi: 'address:asset', calls: vaults })
  const bals = await api.multiCall({ abi: 'uint256:totalAssets', calls: vaults })
  api.addTokens(tokens, bals)
}

module.exports = {
  misrepresentedTokens: true,
  methodology: `Counts WETH deposited to earn yield via NFT lending.`,
  ethereum: {
    tvl,
  },
};
