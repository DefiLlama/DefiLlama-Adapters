const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const indexes = ["0x3527069C603b7d818aA0D3c15Bd4d8d5914aD66a", "0xCE5a3270e5904260B7E4F4CC6e105401ce08788D", "0xf4196172911E47074F8f601339438e4a50075153", "0x3DC60aeC556FCC31E0f86be698550f439e367ECb", "0x5A4957F97C2Ac01793C2aa1d06c6C9f6C20592b8", "0x95bD9c6d2964A560B84788d55a8a135343E1129A", "0x6d494a17f0D6001B20939e2C0dbF2b2Ea4F86393", "0x7841988cA1A133eb30a156562d401B28b5cFaAbd", "0xb4829a14A8F1097592D05e88F5c008baAcBF1077", "0x1915012Cc5B4e9B363db470ba6F4d252B16d6609"]

async function tvl(_, _b, _cb, { api, }) {
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