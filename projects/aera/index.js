const { cachedGraphQuery } = require("../helper/cache");
const { sumTokens2, } = require('../helper/unwrapLPs')

const config = {
    // polygon: 'https://api.thegraph.com/subgraphs/name/fico23/aera-subgraph-polygon',
    ethereum: 'https://api.thegraph.com/subgraphs/name/fico23/aera-subgraph'
}

const OG_ERC4626_TOKENS = ['0x2f79d4ceb79ebd26161e51ca0c9300f970ded54d']

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
        console.log(assets)

        // const erc4626s = []
        // const ogErc4626s = []
        const tokensAndOwners = []

        for (let i = 0; i < vaults.length; ++i) {
          const vault = vaults[i]
          for (let j = 0; j < assets[i].length; ++j) {
            const assetInfo = assets[i][j]
            tokensAndOwners.push([assetInfo.asset, vault.target])
            if (assetInfo.isERC4626) {
              console.log('asset erc4626', assetInfo)
              if (OG_ERC4626_TOKENS.some(x => x === assetInfo.asset.toLowerCase())) {
                ogErc4626s.push([assetInfo.asset, vault.target])
              } else {
                erc4626s.push([assetInfo.asset, vault.target])
              }
            } else {
              tokensAndOwners.push([assetInfo.asset, vault.target])
            }
          }
        }

        console.log('arrays')
        console.log(erc4626s, tokensAndOwners, ogErc4626s)

        const [underlyingTokens, underylingTokensOg] = await Promise.all([
          api.multiCall({ abi: 'address:token', calls: erc4626s.map(x => x[0])}),
          api.multiCall({ abi: 'address:asset', calls: ogErc4626s.map(x => x[0])})
        ])

        console.log('underylingTokens -------------------------------------------')
        console.log(underlyingTokens, underylingTokensOg)

        const [vaultBalances, vaultBalancesOg, underlyingBalances, underlyingBalancesOg] = await Promise.all([
          api.multiCall({abi: 'erc20:balanceOf', calls: erc4626s.map(x => ({target: x[0], params: x[1]}))}),
          api.multiCall({abi: 'erc20:balanceOf', calls: ogErc4626s.map(x => ({target: x[0], params: x[1]}))}),
          api.multiCall({abi: 'uint256:balance', calls: erc4626s.map((v, i) => ({target: underlyingTokens[i]}))}),
          api.multiCall({abi: 'uint256:totalAssets', calls: ogErc4626s.map((v, i) => ({target: underylingTokensOg[i]}))})
        ])

        console.log('vaultBalances -------------------------------------------')
        console.log(vaultBalances, vaultBalancesOg)


        console.log('underlyingBalances -------------------------------------------')
        console.log(underlyingBalances, underlyingBalancesOg)

        return sumTokens2({ api, tokensAndOwners })
      }
    }
  })