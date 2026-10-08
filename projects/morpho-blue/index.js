const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')
const { getLogs } = require("../helper/cache/getLogs");
const abi = require("../helper/abis/morpho.json");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { getMorphoVaults } = require("../helper/curators");
const { config } = require("./config");
const { getExcludedMarketIds, getExcludedAssets, getExcludedVaults } = require("./exclusions");

const eventAbis = {
  createMarket: 'event CreateMarket(bytes32 indexed id, (address loanToken, address collateralToken, address oracle, address irm, uint256 lltv) marketParams)'
}

const nullAddress = ADDRESSES.null

const getMarket = async (api) => {
  const { morphoBlue, fromBlock, blacklistedMarketIds = [], onlyUseExistingCache, } = config[api.chain]
  const useIndexer = api.chain === 'monad' ? true : false
  const extraKey = 'reset-v2'

  let logs = [];
  if (api.chain === 'tac') {
    try {
      logs = await getLogs({ api, target: morphoBlue, eventAbi: eventAbis.createMarket, fromBlock, onlyArgs: true, extraKey, onlyUseExistingCache, useIndexer })
    } catch (e) {
      logs = await getLogs({ api, target: morphoBlue, eventAbi: eventAbis.createMarket, fromBlock, onlyArgs: true, extraKey, onlyUseExistingCache: true, useIndexer })
    }
  } else {
    logs = await getLogs({ api, target: morphoBlue, eventAbi: eventAbis.createMarket, fromBlock, onlyArgs: true, extraKey, onlyUseExistingCache, useIndexer })
  }

  if (api.chain === 'sei') {
    const existingIds = new Set(logs.map(i => i.id.toLowerCase()))
    logs.push(...[
      '0x583da8629bb612169bb4d5753d94d66bffa4390b4f16833a210b75944172f811',
      '0xbb3ef4b802087585438dc6ee178e295f404d133996880db5e23405d1d73f1d27',
      '0xe3c959829d236e3838558318340129a737ae0fffa128d891d1d22728d081e419',
      '0xc56578519e8fb30628d3b8d459193017e776ce8477c0bbf0f2c8de82bd8dccc9',
      '0xd2fa0b94b6f04615c9472bb25bcb755f5ad5a8f4c17fc04837a31046f0ba5c60',
      '0x7d754479f40d06180fa1ee66ce1bf0cd97fc156c8f8458e27a18a95b9d1ad46a',
      '0xd8a344e69e7a2adfb31f5e148f99f231e7738019125aef993a760f680f38795b',
      '0xcb30b5e1cf1cec7419554e5aa7ed07c75716d3fbdd0f605b014056b0d99c6079',
      '0xe55fc8aadc1fefe9a2323ab3307bc969779d0acf4e512d8142f392415d4e6162',
      '0xf0a664c8c553278fccbb9bf7a0b6ff79984e1a3fbd28e6e13870c96ceb9befbf',
    ].filter(i => !existingIds.has(i)).map(id => ({ id })))

  }
  // union with morpho's own feed, never a replacement - the feed is a subset of the list above
  const excluded = new Set([...blacklistedMarketIds.map(i => i.toLowerCase()), ...await getExcludedMarketIds(api)])
  const all = logs.map((i) => i.id.toLowerCase())
  return { markets: all.filter((id) => !excluded.has(id)), excludedMarkets: all.filter((id) => excluded.has(id)) }
}

// tvl sums the whole balance the shared morpho contract holds of each token, so dropping an excluded
// market from the id list does nothing while a valid market uses the same token. Subtract what the
// excluded market still physically holds: supply minus borrowed, since borrowed assets have left the
// contract. Only for tokens we actually summed, or the subtraction would push the token negative.
const subtractExcludedMarkets = async (api, excludedMarkets, countedTokens) => {
  if (!excludedMarkets.length) return
  const { morphoBlue } = config[api.chain]
  const [marketInfos, marketDatas] = await Promise.all([
    api.multiCall({ target: morphoBlue, calls: excludedMarkets, abi: abi.morphoBlueFunctions.idToMarketParams, permitFailure: true }),
    api.multiCall({ target: morphoBlue, calls: excludedMarkets, abi: abi.morphoBlueFunctions.market, permitFailure: true }),
  ])
  marketDatas.forEach((data, i) => {
    if (!data || !marketInfos[i]) return
    const loanToken = marketInfos[i].loanToken.toLowerCase()
    if (!countedTokens.has(loanToken)) return
    const idle = BigInt(data.totalSupplyAssets || 0) - BigInt(data.totalBorrowAssets || 0)
    if (idle > 0n) api.add(loanToken, (-idle).toString())
  })
}

// exclude ethena deposits into markets where collateral is USDe
const ethenaBlacklist = {
  ethereum: {
    wallets: ['0x2Bf5d9a2326Ad3C5Ef8208F91Af79C3ca1F0F67c'],
    vaults: [
      '0xBeEFC1CDAfc5b4a649b54D07AFc6bF0f75C6F4E2',   // USDtB vault
    ],
  },
  robinhood: {
    wallets: ['0x2Bf5d9a2326Ad3C5Ef8208F91Af79C3ca1F0F67c'],
    vaults: [
      '0xbEeFF0fb1Dc19344A87b8479dAb60A2e16160737',   // USDG vault
    ],
  },
}

const tvl = async (api) => {
  const { morphoBlue, blackList = [] } = config[api.chain]

  // sometimes the tokens left in the vault and not allocated to any market yet, we need to query them separately
  const morphoVaults = await getMorphoVaults(api, undefined, {
    getAllVaults: true,
    onlyUseExistingCache: api.chain === 'sei'
  })
  const vaultAssets = await api.multiCall({ abi: 'address:asset', calls: morphoVaults, permitFailure: true })

  // vault share tokens (MetaMorpho / Vault V2) are already counted via their underlying assets, exclude them everywhere
  const vaultSet = new Set(morphoVaults.map(v => v.toLowerCase()))
  const blacklistedTokens = [...blackList, ...morphoVaults, ...await getExcludedAssets(api)]

  // excluded vaults stay blacklisted as tokens above, but their unallocated assets are not counted
  const excludedVaults = new Set(await getExcludedVaults(api))
  const vaultTaO = vaultAssets
    .map((asset, i) => asset && !excludedVaults.has(morphoVaults[i].toLowerCase()) ? [asset, morphoVaults[i]] : null)
    .filter(Boolean)
  await sumTokens2({ api, tokensAndOwners: vaultTaO, blacklistedTokens, permitFailure: true })


  const { markets, excludedMarkets } = await getMarket(api)
  const marketInfos = await api.multiCall({ target: morphoBlue, calls: markets, abi: abi.morphoBlueFunctions.idToMarketParams })
  const collCalls = [...new Set(marketInfos.map(m => m.collateralToken.toLowerCase()).filter(addr => addr !== nullAddress && !vaultSet.has(addr)))];
  const withdrawQueueLengths = await api.multiCall({ calls: collCalls, abi: abi.metaMorphoFunctions.withdrawQueueLength, permitFailure: true })
  const collateralWQLMap = new Map(collCalls.map((addr, i) => [addr, withdrawQueueLengths[i]]));
  const isVaultToken = (addr) => {
    addr = addr.toLowerCase()
    if (vaultSet.has(addr)) return true
    const wql = collateralWQLMap.get(addr)
    return wql != null && wql >= 0 && wql <= 30
  }
  const tokens = [...new Set(marketInfos.flatMap(({ collateralToken, loanToken }) => [collateralToken, loanToken]).filter(t => !isVaultToken(t)))]

  if (ethenaBlacklist[api.chain]) {
    const { wallets = [], vaults = [] } = ethenaBlacklist[api.chain]
    const balanceCalls = wallets.map((wallet) => vaults.map((vault) => ({ target: vault, params: wallet }))).flat()
    const balances = await api.multiCall({ calls: balanceCalls, abi: 'erc20:balanceOf', permitFailure: true })
    const assets = await api.multiCall({ calls: balanceCalls.map(c => c.target), abi: 'address:asset', permitFailure: true })
    const assetBalances = await api.multiCall({ calls: balanceCalls.map((c, i) => ({ ...c, params: balances[i] })), abi: 'function convertToAssets(uint256) view returns (uint256)' })
    assetBalances.forEach((balance, i) => {
      const token = assets[i]
      console.log(`Ethena blacklist - subtracting ${balance / 1e18} of ${token} from TVL`)
      api.add(token, balance * -1)
    })
  }

  await sumTokens2({ api, owner: morphoBlue, tokens, blacklistedTokens, permitFailure: true })
  const blacklistedSet = new Set(blacklistedTokens.map(t => t.toLowerCase()))
  await subtractExcludedMarkets(api, excludedMarkets, new Set(tokens.map(t => t.toLowerCase()).filter(t => !blacklistedSet.has(t))))
  return api.getBalances()
}

const borrowed = async (api) => {
  const { morphoBlue, blackList = [] } = config[api.chain]
  const { markets } = await getMarket(api)
  const marketInfos = await api.multiCall({ target: morphoBlue, calls: markets, abi: abi.morphoBlueFunctions.idToMarketParams })
  const marketDatas = await api.multiCall({ target: morphoBlue, calls: markets, abi: abi.morphoBlueFunctions.market })
  const blackListLower = blackList.map(b => b.toLowerCase())
  const excludedAssets = new Set(await getExcludedAssets(api)) // asset_usage is 'all', so loan or collateral side

  const priceByAddr = await fetchPriceMap(api, marketInfos.flatMap(m => [m.collateralToken, m.loanToken]))
  const chainHasPrices = Object.keys(priceByAddr).length > 0

  marketDatas.forEach((data, idx) => {
    const { collateralToken, loanToken } = marketInfos[idx];
    if (collateralToken.toLowerCase() === '0xda1c2c3c8fad503662e41e324fc644dc2c5e0ccd') return;
    if (blackListLower.includes(loanToken.toLowerCase())) return;
    if (excludedAssets.has(loanToken.toLowerCase()) || excludedAssets.has(collateralToken.toLowerCase())) return;

    if (chainHasPrices && collateralToken && collateralToken.toLowerCase() !== nullAddress) {
      if (!priceByAddr[collateralToken.toLowerCase()]) return;
    }

    let amount = BigInt(data.totalBorrowAssets || 0)
    const supply = BigInt(data.totalSupplyAssets || 0)
    if (amount > supply) amount = supply
    api.add(loanToken, amount.toString());
  });
}

async function fetchPriceMap(api, addresses) {
  const tokens = [...new Set(addresses.filter(a => a && a.toLowerCase() !== nullAddress).map(a => a.toLowerCase()))]
  if (!tokens.length) return {}
  const keys = tokens.map(t => `${api.chain}:${t}`)
  const prices = await sdk.coins.getPrices(keys, 'now').catch(() => ({}))
  const out = {}
  Object.entries(prices).forEach(([k, v]) => {
    if (!v || !v.price) return
    const addr = k.split(':')[1]
    if (addr) out[addr.toLowerCase()] = v
  })
  return out
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl, borrowed }
})
