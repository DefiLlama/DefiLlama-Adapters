const erc4626Abi = require("./erc4626.json");
const { sumTokens2 } = require("../helper/solana");
const { sumTokens2: sumTokensEVM } = require("../helper/unwrapLPs");

const erc4626Vaults = {
  "ethereum": [
    "0x5eF17EE66A64fd5B394362D98f51ba155AeCe9ce",
    "0x6030189834b69919bffBC25E01C596EA5858e46c",
    "0x6B0825b3E079fad25086431F7154acB3073f933B",
    "0xf06e004caB43F326AA3668C8723A8bDBCF5bD165",
    "0xfCB69E5E535e04A809dC8Af7eba59c2FED4b2868",
  ],
  "optimism": [
    "0x2CD4B4EB84028F70e1090B053859B813ef9ad160",
    "0xAD1999728F840082aC3Bf9eA09b30D19a7923bbC",
    "0xCE05f5d12e7DaF74C2239A2264c99d38176ac3B4",
    "0xa850550A115062a860A951a3f77bFD4c22A441fA",
  ]
}

const getERC4626VaultFundsByChain = async (api) => {
  const vaults = erc4626Vaults[api.chain];
  await api.erc4626Sum({ calls: vaults ?? [], isOG4626: true })
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
  ],
  "optimism": [
    "0x923917304012C7E14d122eb1D6A8f49f608bC06B",
    "0x53DAC8d715350AFb3443D346aa3Abd73dA4534F0",
    "0x07E7d45bC488dE9eeD94AA5f9bb8C845F4b21aFa",
    "0xE92B7a8eb449AbA20DA0B2f5b2a4f5f25F95F3C4",
    "0xfCB69E5E535e04A809dC8Af7eba59c2FED4b2868",
    "0xf06e004caB43F326AA3668C8723A8bDBCF5bD165",
  ]
}

const idleCdos = {
  "ethereum": [
    "0xc4574C60a455655864aB80fa7638561A756C5E61",
    "0xE7C6A4525492395d65e736C3593aC933F33ee46e"
  ],
  "polygon_zkevm": [
    "0x6b8A1e78Ac707F9b0b5eB4f34B02D9af84D2b689"
  ],
  "optimism": [
    "0xe49174F0935F088509cca50e54024F6f8a6E08Dd",
    "0x94e399Af25b676e7783fDcd62854221e67566b7f",
    "0x8771128e9E386DC8E4663118BB11EA3DE910e528"
  ]
}

const getERC4626IdleVaultFundsByChain = async (api) => {
  const chain = api.chain
  const trancheTokensMapping = {}

  const cdos = idleCdos[chain]
  const [token, aatrances, bbtrances, aaprices, bbprices] = await Promise.all(["address:token", "address:AATranche", "address:BBTranche", "uint256:priceAA", "uint256:priceBB"].map(abi =>
    api.multiCall({ abi, calls: cdos })))
  const tokensDecimalsResults = await api.multiCall({ abi: 'erc20:decimals', calls: token })

  cdos.forEach((cdo, i) => {
    const tokenDecimals = tokensDecimalsResults[i] || 18
    trancheTokensMapping[aatrances[i]] = {
      token: token[i],
      decimals: tokenDecimals,
      price: aaprices[i] / (10 ** tokenDecimals),
    }
    trancheTokensMapping[bbtrances[i]] = {
      token: token[i],
      decimals: tokenDecimals,
      price: bbprices[i] / (10 ** tokenDecimals),
    }
  })

  const vaults = erc4626VaultsIdle[chain];
  const [_vaultAssets, _totalVaultFunds] = await Promise.all([
    api.multiCall({ abi: erc4626Abi.asset, calls: vaults }),
    api.multiCall({ abi: erc4626Abi.totalAssets, calls: vaults }),
  ])
  return _totalVaultFunds.map((it, idx) => {
    if (!it) return null
    const trancheToken = _vaultAssets[idx]
    const { token, decimals, price } = trancheTokensMapping[trancheToken]
    const underlyingTokenBalance = it * price / (10 ** (18 - decimals))
    api.add(token, underlyingTokenBalance)
  });
}

async function tvl(api) {
  await getERC4626VaultFundsByChain(api);
  if (idleCdos[api.chain])
    await getERC4626IdleVaultFundsByChain(api);

  return sumTokensEVM({ api, resolveLP: true, })
}

async function SolanaTvl() {
  const tokensAndOwners = [
    ['mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So', 'AkkGFKVJY8o5MRqBf2St4Q8NQnfTTi2bSssMMk9zXAMr'],
    ['J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn', '86vJYeZiXc9Uq1wmtLzERDfQzAnpoJgs2oF5Y4BirKkn'],
    ['bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1', '8HpEPmkKb6T7xNDzhheWhK2P6BEdp2nGv7JbcEoDmDST'],
    ['SoLW9muuNQmEAoBws7CWfYQnXRXMVEG12cQhy6LE2Zf', '6iK6zK2nDQswaCrpELNYnnbuo4vwzpFsEpZYyqwpRWbD']
  ]

  return sumTokens2({ tokensAndOwners })
}

async function staking() {
  const tokensAndOwners = [
    ['AMUwxPsqWSd1fbCGzWsrRKDcNoduuWMkdR38qPdit8G8', 'NEFYtG7y49aLYbyPqQHAkzzCSms5VmVtA6bJWHJErSD']
  ]

  return sumTokens2({ tokensAndOwners })
}

module.exports = {
  ethereum: { tvl },
  polygon_zkevm: { tvl },
  optimism: { tvl },
  solana: { tvl: SolanaTvl, staking, }
}