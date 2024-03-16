const { cachedGraphQuery } = require("../helper/cache");
const { sumTokens2, } = require('../helper/unwrapLPs')

const config = {
    // polygon: 'https://api.thegraph.com/subgraphs/name/fico23/aera-subgraph-polygon',
    ethereum: 'https://api.thegraph.com/subgraphs/name/fico23/aera-subgraph'
}

const graphQuery = `query MyQuery($block: Int) {vaultCreateds(block: {number: $block}){ id vault }}`

const assetRegistryABI = {
  "inputs": [],
  "name": "assets",
  "outputs": [
      {
          "components": [
              {
                  "internalType": "contract IERC20",
                  "name": "asset",
                  "type": "address"
              },
              {
                  "internalType": "uint256",
                  "name": "heartbeat",
                  "type": "uint256"
              },
              {
                  "internalType": "bool",
                  "name": "isERC4626",
                  "type": "bool"
              },
              {
                  "internalType": "contract AggregatorV2V3Interface",
                  "name": "oracle",
                  "type": "address"
              }
          ],
          "internalType": "struct IAssetRegistry.AssetInformation[]",
          "name": "",
          "type": "tuple[]"
      }
  ],
  "stateMutability": "view",
  "type": "function"
}

const erc4626ABI = {
  "type": "function",
  "name": "convertToAssets",
  "inputs": [
      {
          "name": "shares",
          "type": "uint256",
          "internalType": "uint256"
      }
  ],
  "outputs": [
      {
          "name": "assets",
          "type": "uint256",
          "internalType": "uint256"
      }
  ],
  "stateMutability": "view"
}

Object.keys(config).forEach(chain => {
    module.exports[chain] = {
      tvl: async (_, _b, _cb, { api, }) => {
        const graphUrl = config[chain]
        const cacheKey = `aera-${chain}`

        block = (await api.getBlock()) - 100 // subgraph sync lags

        const { vaultCreateds } = await cachedGraphQuery(cacheKey, graphUrl, graphQuery, { api, variables: { block }})

        const vaults = vaultCreateds.map(x => ({ target: x.vault}))

        const assetRegistries = await api.multiCall({  abi: 'address:assetRegistry', calls: vaults})

        const assets = await api.multiCall({ abi: assetRegistryABI, calls: assetRegistries.map(x => ({ target: x}))})

        const erc4626sAndOwners = []
        const tokensAndOwners = []

        for (let i = 0; i < vaults.length; ++i) {
          const vault = vaults[i]
          for (let j = 0; j < assets[i].length; ++j) {
            const assetInfo = assets[i][j]
            if (assetInfo.isERC4626) {
              erc4626sAndOwners.push([assetInfo.asset, vault.target])
            } else {
              tokensAndOwners.push([assetInfo.asset, vault.target])
            }
          }
        }

        const underlyingTokens = await api.multiCall({ abi: 'address:asset', calls: erc4626sAndOwners.map(x => x[0])})

        const vaultErc4626Balances = await api.multiCall({abi: 'erc20:balanceOf', calls: erc4626sAndOwners.map(x => ({target: x[0], params: x[1]}))})

        const vaultConvertToAssets = await api.multiCall({ abi: erc4626ABI, calls: erc4626sAndOwners.map((x, i) => ({target: x[0], params: vaultErc4626Balances[i]}))})

        const tokenBalancesMap = {}
        
        underlyingTokens.forEach((token, i) => {
          if (tokenBalancesMap[token]) {
            tokenBalancesMap[token] += BigInt(vaultConvertToAssets[i])
          } else {
            tokenBalancesMap[token] = BigInt(vaultConvertToAssets[i])
          }
        })

        const tokens = []
        const balances = []
        Object.keys(tokenBalancesMap).forEach(token => {
          tokens.push(token)
          balances.push(tokenBalancesMap[token].toString())
        })

        api.addTokens(tokens, balances)
        
        return sumTokens2({ api, tokensAndOwners })
      }
    }
  })