const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')
const { getLogs } = require("../helper/cache/getLogs");
const abi = require("../helper/abis/morpho.json");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { getMorphoVaults } = require("../helper/curators");
const { getUniqueAddresses, normalizeAddress } = require("../helper/tokenMapping");
const { ethers } = require("ethers");
const { config } = require("./config");

const eventAbis = {
  createMarket: 'event CreateMarket(bytes32 indexed id, (address loanToken, address collateralToken, address oracle, address irm, uint256 lltv) marketParams)',
  supplyCollateral: 'event SupplyCollateral(bytes32 indexed id, address indexed caller, address indexed onBehalf, uint256 assets)',
}

const nullAddress = ADDRESSES.null
const supplyCollateralTopic = ethers.id('SupplyCollateral(bytes32,address,address,uint256)')

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
  return logs.map((i) => i.id.toLowerCase()).filter((id) => !blacklistedMarketIds.includes(id))
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

// `tvl` sums the whole Morpho balance of every token that shows up in a live market, so
// dropping a market from `blacklistedMarketIds` only removes its collateral from TVL when no
// live market uses the same collateral token. Where the token is shared, the blacklisted
// market's collateral is still counted and has to be subtracted explicitly.
// eg: on ethereum the msY/USDC 86% market is blacklisted but the msY/USDC 91.5% one is not,
// so all ~34.3M msY held by Morpho was counted instead of the ~4.4M of the live market.
const subtractBlacklistedCollateral = async (api, countedTokens) => {
  const { morphoBlue, fromBlock, blacklistedMarketIds = [], onlyUseExistingCache, } = config[api.chain]
  if (!blacklistedMarketIds.length) return

  const ids = blacklistedMarketIds.map(i => i.toLowerCase())
  const marketInfos = await api.multiCall({ target: morphoBlue, calls: ids, abi: abi.morphoBlueFunctions.idToMarketParams, permitFailure: true })

  // only the markets whose collateral token is still part of the summed token set leak into tvl
  const leakingMarkets = []
  marketInfos.forEach((market, i) => {
    if (!market) return
    const collateralToken = normalizeAddress(market.collateralToken, api.chain)
    if (collateralToken === nullAddress) return
    if (!countedTokens.has(collateralToken)) return
    leakingMarkets.push({ id: ids[i], collateralToken })
  })
  if (!leakingMarkets.length) return

  // Morpho tracks collateral per position only, there is no market level total, so the set of
  // collateral suppliers has to come from the logs. One cached log query per market keeps the
  // cache valid when the blacklist changes.
  const supplierLogs = await Promise.all(leakingMarkets.map(({ id }) => getLogs({
    api, target: morphoBlue, eventAbi: eventAbis.supplyCollateral, fromBlock, onlyArgs: true,
    extraKey: `supply-collateral-${id}`, onlyUseExistingCache,
    topics: [supplyCollateralTopic, id],
  })))

  const calls = []
  const tokens = []
  leakingMarkets.forEach(({ id, collateralToken }, i) => {
    const suppliers = getUniqueAddresses(supplierLogs[i].map(log => log.onBehalf), api.chain)
    suppliers.forEach(supplier => {
      calls.push({ target: morphoBlue, params: [id, supplier] })
      tokens.push(collateralToken)
    })
  })

  const positions = await api.multiCall({ calls, abi: abi.morphoBlueFunctions.position, permitFailure: true })
  const collateralByToken = {}
  positions.forEach((position, i) => {
    if (!position) return
    collateralByToken[tokens[i]] = (collateralByToken[tokens[i]] ?? 0n) + BigInt(position.collateral)
  })

  // on markets left with bad debt Morpho can still book collateral it no longer holds (eg the
  // resolv markets on ethereum account for 6M wstUSR while the contract holds none of it), so
  // cap each subtraction at what is actually there to keep the balance from going negative
  const leakedTokens = Object.keys(collateralByToken)
  const heldBalances = await api.multiCall({ abi: 'erc20:balanceOf', calls: leakedTokens.map(token => ({ target: token, params: morphoBlue })), permitFailure: true })
  leakedTokens.forEach((token, i) => {
    if (heldBalances[i] == null) return
    const amount = collateralByToken[token] < BigInt(heldBalances[i]) ? collateralByToken[token] : BigInt(heldBalances[i])
    if (amount === 0n) return
    sdk.log(`morpho-blue: subtracting ${amount} of ${token} held for blacklisted markets on ${api.chain}`)
    api.add(token, (-amount).toString())
  })
}

const tvl = async (api) => {
  const { morphoBlue, blackList = [] } = config[api.chain]

  // sometimes the tokens left in the vault and not allocated to any market yet, we need to query them separately
  const morphoVaults = await getMorphoVaults(api, undefined, {
    getAllVaults: true,
    onlyUseExistingCache: api.chain === 'sei'
  })
  const vaultAssets = await api.multiCall({ abi: 'address:asset', calls: morphoVaults, permitFailure: true })

  const vaultTaO = vaultAssets
    .map((asset, i) => asset ? [asset, morphoVaults[i]] : null)
    .filter(Boolean)
  await sumTokens2({ api, tokensAndOwners: vaultTaO, blacklistedTokens: blackList, permitFailure: true })


  const markets = await getMarket(api)
  const marketInfos = await api.multiCall({ target: morphoBlue, calls: markets, abi: abi.morphoBlueFunctions.idToMarketParams })
  const collCalls = [...new Set(marketInfos.map(m => m.collateralToken.toLowerCase()).filter(addr => addr !== nullAddress))];
  const withdrawQueueLengths = await api.multiCall({ calls: collCalls, abi: abi.metaMorphoFunctions.withdrawQueueLength, permitFailure: true })
  const collateralWQLMap = new Map(collCalls.map((addr, i) => [addr, withdrawQueueLengths[i]]));
  const filterMarkets = marketInfos.filter(m => {
    const wql = collateralWQLMap.get(m.collateralToken.toLowerCase());
    return wql == null || wql > 30 || wql < 0;
  });
  const tokens = filterMarkets.flatMap(({ collateralToken, loanToken }) => [collateralToken, loanToken])

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

  if (api.chain === 'stable' && tokens.includes(ADDRESSES.null))
    blackList.push(ADDRESSES.stable.USDT0)  // USDT0 and gas token on stable are the same thing

  const blackListSet = new Set(blackList.map(i => normalizeAddress(i, api.chain)))
  const countedTokens = new Set(getUniqueAddresses(tokens, api.chain).filter(i => !blackListSet.has(i)))
  await subtractBlacklistedCollateral(api, countedTokens)

  return sumTokens2({ api, owner: morphoBlue, tokens, blacklistedTokens: blackList, permitFailure: true })
}

const borrowed = async (api) => {
  const { morphoBlue, blackList = [] } = config[api.chain]
  const markets = await getMarket(api)
  const marketInfos = await api.multiCall({ target: morphoBlue, calls: markets, abi: abi.morphoBlueFunctions.idToMarketParams })
  const marketDatas = await api.multiCall({ target: morphoBlue, calls: markets, abi: abi.morphoBlueFunctions.market })
  const blackListLower = blackList.map(b => b.toLowerCase())

  const priceByAddr = await fetchPriceMap(api, marketInfos.flatMap(m => [m.collateralToken, m.loanToken]))
  const chainHasPrices = Object.keys(priceByAddr).length > 0

  marketDatas.forEach((data, idx) => {
    const { collateralToken, loanToken } = marketInfos[idx];
    if (collateralToken.toLowerCase() === '0xda1c2c3c8fad503662e41e324fc644dc2c5e0ccd') return;
    if (blackListLower.includes(loanToken.toLowerCase())) return;

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
