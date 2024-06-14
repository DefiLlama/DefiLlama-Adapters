const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const { getConfig } = require('../helper/cache')

async function tvl(api) {
  const response = await getConfig('velvet-capital', "https://defivas.xyz/api/portfolio")
  const indexes = response.data;
  const ownerTokens = []
  const [vaults, tokens, libraries] = await Promise.all([
    api.multiCall({ abi: 'address:vault', calls: indexes }),
    api.multiCall({ abi: 'address[]:getTokens', calls: indexes }),
    api.multiCall({ abi: 'address:indexSwapLibrary', calls: indexes }),
  ])

  const tokenMetadatas = await api.multiCall({ abi: 'address:tokenMetadata', calls: libraries })

  await Promise.all(tokens.map(async (tokens, i) => {
    const vault = vaults[i]
    const tokenMetadata = tokenMetadatas[i]
    const tokenRes = await api.multiCall({ abi: 'function vTokens(address) public view returns(address)', target: tokenMetadata, calls: tokens })
    const vaultTokens = tokenRes.map((t, j) => (t !== nullAddress) ? t : tokens[j])
    ownerTokens.push([vaultTokens, vault])
  }))
  return sumTokens2({ api, ownerTokens })
}

module.exports = {
  methodology: 'calculates overall value deposited across different protocol portfolios',
  bsc: { tvl }
}