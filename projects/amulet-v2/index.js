const sdk = require("@defillama/sdk");
const erc4626Abi = require("./erc4626.json");
const BigNumber = require("bignumber.js");
const BN = require("bn.js");
const { PublicKey } = require("@solana/web3.js")
const { getConnection, sumTokens2 } = require("../helper/solana");

const erc4626Vaults = {
    "ethereum": [
        {
            "Vault": "0x5eF17EE66A64fd5B394362D98f51ba155AeCe9ce",
        },
        {
            "Vault": "0x6030189834b69919bffBC25E01C596EA5858e46c",
        },
        {
            "Vault": "0x6B0825b3E079fad25086431F7154acB3073f933B",
        },
        {
            "Vault": "0xf06e004caB43F326AA3668C8723A8bDBCF5bD165",
        },
        {
            "Vault": "0xfCB69E5E535e04A809dC8Af7eba59c2FED4b2868",
        },
    ]
}

const solanaVaults = {
    "solana": [
        {
            "account": "JA6yX1tzsrCTMbFKaT1VrLKzBNuEHuT8SNYVZpYrmxkC",
        },
        {
            "account": "CXMwkuWvjNF6HhR8Kze3z3exheoE2xgQtJfmnLtRYeWX",
        },
        {
            "account": "CXMwkuWvjNF6HhR8Kze3z3exheoE2xgQtJfmnLtRYeWX",
        },
    ]
}

const getERC4626VaultFundsByChain = async (api, chain, block) => {
    const vaults = erc4626Vaults[chain];
    const vaultCalls = vaults.map((v) => ({ target: v.Vault }));

    const [_vaultAssets, _totalVaultFunds] = await Promise.all([
        api.multiCall({abi: erc4626Abi.asset, calls: vaultCalls}),
        api.multiCall({abi: erc4626Abi.totalAssets, calls: vaultCalls}),
    ]).then((o) => o.map((it) => it));
    return _totalVaultFunds.map((it, idx) => ({
        asset: _vaultAssets[idx],
        funds: it,
    }));
}


const erc4626VaultsIdle = {
    "ethereum": [
        {
            "Vault": "0xFDAD59EF0686C3Da702b7D651a3bD35a539c8Bc4",
        },
        {
            "Vault": "0x5e2dA626313ceF5F67D21616df6E7a531e41c3F9",
        },
        {
            "Vault": "0x695E5C49eAeEb5333e2AF0dDb27722D36E9324fa",
        },
        {
            "Vault": "0x4a728224B87C63b53C5FBcacd95b5c3f0c9f5B22",
        }
    ],
    "polygon_zkevm": [
        {
            "Vault": "0x923917304012C7E14d122eb1D6A8f49f608bC06B",
        },
        {
            "Vault": "0x53DAC8d715350AFb3443D346aa3Abd73dA4534F0",
        }
    ],
    "optimism": [
        {
            "Vault": "0x923917304012C7E14d122eb1D6A8f49f608bC06B",
        },
        {
            "Vault": "0x53DAC8d715350AFb3443D346aa3Abd73dA4534F0",
        },
        {
            "Vault": "0x07E7d45bC488dE9eeD94AA5f9bb8C845F4b21aFa",
        },
        {
            "Vault": "0xE92B7a8eb449AbA20DA0B2f5b2a4f5f25F95F3C4",
        },
        {
            "Vault": "0xfCB69E5E535e04A809dC8Af7eba59c2FED4b2868",
        },
        {
            "Vault": "0xf06e004caB43F326AA3668C8723A8bDBCF5bD165",
        }
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

const getERC4626IdleVaultFundsByChain = async (api, chain, block) => {
    const trancheTokensMapping = {}

    const cdos = idleCdos[chain]
    const [strategyToken, token, aatrances, bbtrances, aaprices, bbprices] = await Promise.all(['address:strategyToken', "address:token", "address:AATranche", "address:BBTranche", "uint256:priceAA", "uint256:priceBB"].map(abi => 
        api.multiCall({ abi, calls: cdos })))
    const tokenCalls = token.map((v) => ({ target: v }))
    const tokensDecimalsResults = await api.multiCall({abi: 'erc20:decimals', calls: tokenCalls})

    cdos.forEach((cdo, i) => {
        const tokenDecimals = tokensDecimalsResults[i] || 18
        trancheTokensMapping[aatrances[i]] = {
            token: token[i],
            decimals: tokenDecimals,
            price: BigNumber(aaprices[i]).div(`1e${tokenDecimals}`).toFixed()
        }
        trancheTokensMapping[bbtrances[i]] = {
            token: token[i],
            decimals: tokenDecimals,
            price: BigNumber(bbprices[i]).div(`1e${tokenDecimals}`).toFixed()
        }
    })

    const vaults = erc4626VaultsIdle[chain];
    const vaultCalls = vaults.map((v) => ({ target: v.Vault }));
    const [_vaultAssets, _totalVaultFunds] = await Promise.all([
        api.multiCall({abi: erc4626Abi.asset, calls: vaultCalls}),
        api.multiCall({abi: erc4626Abi.totalAssets, calls: vaultCalls}),
    ]).then((o) => o.map((it) => it));
    return _totalVaultFunds.map((it, idx) => {
        const trancheToken = _vaultAssets[idx]
        const decimals = trancheTokensMapping[trancheToken].decimals
        const trancheTokenPrice = trancheTokensMapping[trancheToken].price || 1
        const underlyingToken = trancheTokensMapping[trancheToken].token
        const underlyingTokenBalance = BigNumber(it || 0).times(trancheTokenPrice).div(`1e18`).times(`1e${decimals}`).toFixed(0)
        return {
            asset: underlyingToken,
            funds: underlyingTokenBalance,
        }
    });
}

async function tvl(_, block, _cb, { api, }) {
    const balances = {}
    if (erc4626Vaults[api.chain]){
        const vaultFunds = await getERC4626VaultFundsByChain(api, api.chain, block);
        for (const { asset, funds } of vaultFunds) {
            sdk.util.sumSingleBalance(balances, api.chain + ':' + asset, funds)
        }
    }
    if (idleCdos[api.chain]){
        const vaultIdleFunds = await getERC4626IdleVaultFundsByChain(api, api.chain, block);
        for (const { asset, funds } of vaultIdleFunds) {
            sdk.util.sumSingleBalance(balances, api.chain + ':' + asset, funds)
        }
    }
    if (solanaVaults[api.chain]) {
        return SolanaTvl()
    }
    return balances
}

async function SolanaTvl() {
    const tokensAndOwners = [
  
      ['mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So', 'AkkGFKVJY8o5MRqBf2St4Q8NQnfTTi2bSssMMk9zXAMr'],
      ['J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn', '86vJYeZiXc9Uq1wmtLzERDfQzAnpoJgs2oF5Y4BirKkn'],
      ['bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1', '8HpEPmkKb6T7xNDzhheWhK2P6BEdp2nGv7JbcEoDmDST']
  
    ]

    return sumTokens2({ tokensAndOwners })
}

module.exports = {
    ethereum: { tvl },
    polygon_zkevm: { tvl },
    optimism: { tvl },
    solana: { tvl }
}