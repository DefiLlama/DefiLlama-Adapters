const ROUTER_ADDRESS = "0x96418df8b474e90e49183cc23fa41e4ad8b0ddbe"

const bonds = [
  '0x90D53b872ce6421122B41a290aCdD22a5eD931bd', // agatobwe - https://www.agatobwe.eco/
]

async function tvl(api) {
  const [data, supply, decimals,] = await Promise.all([
    api.multiCall({
      abi: 'function tokenData(address) view returns (address issuer, uint256 issuancePrice, uint256 expiryPrice, address issuanceTokenAddress)',
      target: ROUTER_ADDRESS,
      calls: bonds
    }),
    api.multiCall({ calls: bonds, abi: 'erc20:totalSupply', }),
    api.multiCall({ calls: bonds, abi: 'erc20:decimals', }),
  ])

  const total = data.reduce((acc, { issuancePrice }, i) => {
    const val = (issuancePrice / 1e8) * supply[i] / (10 ** decimals[i])
    return val + acc
  }, 0)

  return {
    tether: total
  }
}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'Gets the value of all tokens managed through frigg.eco universe',
  ethereum: {
    tvl
  },
}