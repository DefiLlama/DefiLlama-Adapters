
const { sumERC4626Vaults } = require("../helper/erc4626");

const erc4626Abi = {
  "totalAssets": "uint256:totalAssets",
  "asset": "address:asset"
}

const erc4626Vaults = {
  "ethereum": [
    "0x5eF17EE66A64fd5B394362D98f51ba155AeCe9ce",
    "0x6030189834b69919bffBC25E01C596EA5858e46c",
    "0x6B0825b3E079fad25086431F7154acB3073f933B",
    "0xf06e004caB43F326AA3668C8723A8bDBCF5bD165",
    "0xfCB69E5E535e04A809dC8Af7eba59c2FED4b2868",
  ]
}

const erc4626VaultsIdle = {
  "ethereum": [
    "0xFDAD59EF0686C3Da702b7D651a3bD35a539c8Bc4",
    "0x5e2dA626313ceF5F67D21616df6E7a531e41c3F9",
    "0x695E5C49eAeEb5333e2AF0dDb27722D36E9324fa",
    "0x4a728224B87C63b53C5FBcacd95b5c3f0c9f5B22",
  ],
  "polygon_zkevm": [
    "0x923917304012C7E14d122eb1D6A8f49f608bC06B",
    "0x53DAC8d715350AFb3443D346aa3Abd73dA4534F0",
  ]
}

const idleCdos = {
  "ethereum": [
    "0xc4574C60a455655864aB80fa7638561A756C5E61",
    "0xE7C6A4525492395d65e736C3593aC933F33ee46e"
  ],
  "polygon_zkevm": [
    "0x6b8A1e78Ac707F9b0b5eB4f34B02D9af84D2b689"
  ]
}

const getERC4626IdleVaultFundsByChain = async (api) => {
  const cdos = idleCdos[api.chain]
  const vaults = erc4626VaultsIdle[api.chain];
  if (!cdos || !vaults) return;
  const trancheTokensMapping = {}

  const [token, aatrances, bbtrances, aaprices, bbprices] = await Promise.all(["address:token", "address:AATranche", "address:BBTranche", "uint256:priceAA", "uint256:priceBB"].map(abi =>
    api.multiCall({ abi, calls: cdos })))
  const tokensDecimalsResults = await api.multiCall({ abi: 'erc20:decimals', calls: token })

  cdos.forEach((cdo, i) => {
    const tokenDecimals = tokensDecimalsResults[i] || 18
    trancheTokensMapping[aatrances[i]] = {
      token: token[i],
      decimals: tokenDecimals,
      price: aaprices[i] / 10 ** tokenDecimals
    }
    trancheTokensMapping[bbtrances[i]] = {
      token: token[i],
      decimals: tokenDecimals,
      price: bbprices[i] / 10 ** tokenDecimals
    }
  })

  const [_vaultAssets, _totalVaultFunds] = await Promise.all([
    api.multiCall({ abi: erc4626Abi.asset, calls: vaults }),
    api.multiCall({ abi: erc4626Abi.totalAssets, calls: vaults }),
  ]).then((o) => o.map((it) => it));
  return _totalVaultFunds.map((it, idx) => {
    const trancheToken = _vaultAssets[idx]
    const decimals = trancheTokensMapping[trancheToken].decimals
    const trancheTokenPrice = trancheTokensMapping[trancheToken].price || 1
    const underlyingToken = trancheTokensMapping[trancheToken].token
    const underlyingTokenBalance = (it || 0) * trancheTokenPrice / 10 ** (18 - decimals)
    api.add(underlyingToken, underlyingTokenBalance)
  });
}

async function tvl(_, block, _cb, { api, }) {
  await sumERC4626Vaults({ api, vaults: erc4626Vaults[api.chain] ?? [] })
  await getERC4626IdleVaultFundsByChain(api)
  return api.getBalances()
}

module.exports = {
  ethereum: { tvl },
  polygon_zkevm: { tvl }
}