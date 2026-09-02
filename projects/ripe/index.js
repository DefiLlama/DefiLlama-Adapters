const { sumTokens2 } = require('../helper/unwrapLPs');
const { getConfig } = require('../helper/cache');
const { getLogs2 } = require('../helper/cache/getLogs');
const { staking } = require('../helper/staking')

const RIPE_REGISTRY_IDS = {
  ledger: 4,
  sweepEndaoment: 14,
  // Endaoment Funds is a protocol reserve, not user deposits. RegId 21 belongs in Ripe's
  // separate DefiLlama Treasury submission and is deliberately never added to TVL owners.
  // Robinhood block 43,341,995 logged 84d0... -> 0fC5... -> 84d0... within one transaction;
  // block-final registry state is unaffected, and this id is not consumed by the TVL adapter.
  excludedEndaomentFundsTreasury: 21,
}
const ADDRESS_UPDATE_CONFIRMED_EVENT = 'event AddressUpdateConfirmed(uint256 regId, string description, address indexed newAddr, address indexed prevAddr, uint256 version, string registry)'

// Named policy set so its treatment and disclosure switch together, with the evidence explicit.
// At block 52,163,750, the four marks totalled $3,862,477.21. Moto's counter-reserve ceiling
// was $7,473.09 (516.85x), while Luna's constant-product exit floor was $435.78 (8,863.37x).
// Ripe's own PriceDesk marks every token below at zero; each has ltv=0 and liqThreshold=0
// on-chain, so they back none of the 7,686.70 GREEN outstanding.
const PRICED_VAULT4_MEMECOINS_BY_CHAIN = {
  robinhood: {
    PONS: '0x39dbed3a2bd333467115de45665cc57f813c4571', // $2,164,402.43 booked / $712.22 exit — 3,038.95x
    CASHCAT: '0x020bfc650a365f8bb26819deaabf3e21291018b4', // $1,220,668.77 booked / $6,462.80 exit — 188.88x
    Index: '0x56910d4409f3a0c78c64dd8d0545ff0705389870', // $288,752.81 booked / $285.63 exit — 1,010.93x
    STONKBROKER: '0xe934e36a439c94017b64a3fece66af12099abf50', // $188,653.21 booked / $12.44 exit — 15,165.05x
  },
}

const config = {
  base: {
    assetsCacheKey: 'ripe-assets-base',
    assetsUrl: 'https://api.ripe.finance/api/ripe/assets?chain=base',
    addressesCacheKey: 'ripe-addresses-base',
    addressesUrl: 'https://api.ripe.finance/api/chains/addresses?chain=base',
    start: 1754006400,
    fromBlock: 32_085_883,
    sweepEndaoment: { fromBlock: 32_086_527 },
    erc4626Wrappers: [
      {
        wrapper: '0x99e65176f7fa8743e3fbaef277d1da448e361367', // undyUSDC
        underlying: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', // USDC
        fromBlock: 45_410_174,
      },
      {
        wrapper: '0x02981db1a99a14912b204437e7a2e02679b57668', // undyETH
        underlying: '0x4200000000000000000000000000000000000006', // WETH
        fromBlock: 38_023_392,
      },
      {
        wrapper: '0x3fb0fc9d3ddd543ad1b748ed2286a022f4638493', // undyBTC
        underlying: '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf', // cbBTC
        fromBlock: 38_023_397,
      },
      {
        wrapper: '0x1cb8dab80f19fc5aca06c2552aecd79015008ea8', // undyEURC
        underlying: '0x60a3e35cc302bfa44cb288bc5a4f316fdb1adb42', // EURC
        fromBlock: 38_023_408,
      },
      {
        wrapper: '0x96f1a7ce331f40afe866f3b707c223e377661087', // undyAERO
        underlying: '0x940181a94a35a4569e4529a3cdfb74e38fd98631', // AERO
        fromBlock: 38_023_403,
      },
    ],
    curveLpExternalLegs: [{
      pool: '0xd6c283655b42fa0eb2685f7ab819784f071459dc', // GREEN/USDC
      underlying: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', // USDC
      coinIndex: 0,
      fromBlock: 32_086_681,
    }],
    ripeToken: '0x2A0a59d6B975828e781EcaC125dBA40d7ee5dDC0',
    pool2Tokens: [
      { token: '0x765824aD2eD0ECB70ECc25B0Cf285832b335d6A9', fromBlock: 33_434_502 }, // RIPE/WETH
      { token: '0x2aEf3eE3Eb64B7EC0B4ef57BB7E004747FE87eFc', fromBlock: 34_396_518 }, // RIPE/GREEN
    ],
    ripeHq: '0x6162df1b329E157479F8f1407E888260E0EC3d2b',
    govVault: '0xe42b3dC546527EB70D741B185Dc57226cA01839D',
  },
  robinhood: {
    assetsCacheKey: 'ripe-assets-robinhood',
    assetsUrl: 'https://api.ripe.finance/api/ripe/assets?chain=robinhood',
    addressesCacheKey: 'ripe-addresses-robinhood',
    addressesUrl: 'https://api.ripe.finance/api/chains/addresses?chain=robinhood',
    start: 1785871180,
    fromBlock: 27_870_288,
    sweepEndaoment: { fromBlock: 27_895_191 },
    // Deployment gates only, not policy exclusions: the live endpoint includes these assets when
    // backfilling blocks before their contracts existed.
    historicalTokenFromBlocks: {
      '0x85a574f2ff0795685f58d1d7b0d4b51f148ac489': 36_772_684, // PRINTER
      '0x5a86828efd322bfb16d93cfed16ee9bc14940d7f': 35_489_899, // QUOTRON
    },
    excludePricedVault4Memecoins: false, // Flip only this boolean to change treatment and disclosure.
    memecoinMethodologies: {
      include: [
        "TVL is third-party collateral deposited in Ripe's vaults, valued at coins.llama.fi marks.",
        "On Robinhood this includes a 0%-LTV vault of locally-issued memecoins that cannot be borrowed against and that Ripe's own PriceDesk assigns no value. At block 52,163,750 those four tokens were marked at $3,862,477.21, 94.26% of Robinhood TVL; their combined counter-reserves give a $7,473.09 theoretical exit-liquidity ceiling, while a constant-product simulation gives a $435.78 exit-liquidity floor.",
        "Underscore vault shares held as Ripe collateral are unwrapped to their ERC-4626 underlying; sNET is excluded because it has no observable backing or conversion rate. GREEN, sGREEN and Curve GREEN legs, including GREEN/sGREEN stability-pool deposits, are excluded as protocol-minted, following projects/helper/liquity.js and projects/flux-protocol; only the pools' USDC/USDG legs count.",
        "RIPE and GREEN are priced from pools Ripe itself owns. coins.llama.fi publishes one bit-identical CCIP-bridged RIPE mark for both chains from Robinhood RIPE/NVDA 0x9b8537be, whose governance vault and multisig hold 99.8628% of LP; across all RIPE pools genuinely third-party counter-assets total about $2,900 against roughly $4.46M of RIPE booked in staking. The RIPE mark is 20-30 minutes stale by construction, and Ripe's Robinhood PriceDesk returns 0 from a monitoring-only source. GREEN marks come from the 99.99636%-Ripe-owned Base and 99.9952%-Ripe-owned Robinhood Curve pools; they hold about $315k USDC and $365k USDG and absorb about $200k GREEN below 0.4% slippage, but that depth is Ripe's withdrawable capital.",
        'Staking is RIPE in the governance vault at that market mark; pool2 reserve-unwraps RIPE-paired LPs at constituent marks; borrowed is outstanding GREEN debt from Ledger.totalDebt() at $1 face value.',
      ].join(' '),
      exclude: [
        "TVL is third-party collateral deposited in Ripe's vaults, valued at coins.llama.fi marks.",
        "Collateral in Ripe's 0%-LTV vaults is excluded where Ripe's own PriceDesk assigns it no value, it cannot be borrowed against, and its aggregate on-chain exit liquidity is under 1% of its quoted mark. On Robinhood this excludes four coins.llama.fi-priced tokens marked at $3,862,477.21 at block 52,163,750; their combined counter-reserves give a $7,473.09 theoretical exit-liquidity ceiling, while a constant-product simulation gives a $435.78 exit-liquidity floor. This follows DefiLlama's published Unproductive Assets guidance (https://docs.llama.fi/list-your-project/what-to-include-as-tvl) and matches exclusion patterns in projects/uniswap-v4, projects/faroswap, projects/morpho-blue and projects/aqua-network.",
        "Underscore vault shares held as Ripe collateral are unwrapped to their ERC-4626 underlying; sNET is excluded because it has no observable backing or conversion rate. GREEN, sGREEN and Curve GREEN legs, including GREEN/sGREEN stability-pool deposits, are excluded as protocol-minted, following projects/helper/liquity.js and projects/flux-protocol; only the pools' USDC/USDG legs count.",
        "RIPE and GREEN are priced from pools Ripe itself owns. coins.llama.fi publishes one bit-identical CCIP-bridged RIPE mark for both chains from Robinhood RIPE/NVDA 0x9b8537be, whose governance vault and multisig hold 99.8628% of LP; across all RIPE pools genuinely third-party counter-assets total about $2,900 against roughly $4.46M of RIPE booked in staking. The RIPE mark is 20-30 minutes stale by construction, and Ripe's Robinhood PriceDesk returns 0 from a monitoring-only source. GREEN marks come from the 99.99636%-Ripe-owned Base and 99.9952%-Ripe-owned Robinhood Curve pools; they hold about $315k USDC and $365k USDG and absorb about $200k GREEN below 0.4% slippage, but that depth is Ripe's withdrawable capital.",
        'Staking is RIPE in the governance vault at that market mark; pool2 reserve-unwraps RIPE-paired LPs at constituent marks; borrowed is outstanding GREEN debt from Ledger.totalDebt() at $1 face value.',
      ].join(' '),
    },
    pricedVault4Memecoins: PRICED_VAULT4_MEMECOINS_BY_CHAIN.robinhood,
    erc4626Wrappers: [],
    unbackedWrappers: [
      '0xb773ec2c326b7f98a5a83fc098825492f020a4c7', // sNET: no observable backing or conversion rate
    ],
    curveLpExternalLegs: [{
      pool: '0x2fd13b49f970e8c6d89283056c1c6281214b7eb6', // GREEN/USDG
      underlying: '0x5fc5360d0400a0fd4f2af552add042d716f1d168', // USDG
      coinIndex: 0,
      fromBlock: 27_897_801,
    }],
    ripeToken: '0x4d3f37a965b21ab4122e92dd41d2693e742c883b',
    pool2Tokens: [
      { token: '0xba6f6cba1a4104000847d4fdccb676e99166cece', fromBlock: 28_925_240 }, // RIPE/WETH
      { token: '0x9b8537be0fd5cf9b2ad495c5a85130d5bae4769d', fromBlock: 48_602_839 }, // RIPE/NVDA
    ],
    ripeHq: '0xd4e82ae1de673bba3b53386a2d2c630ae6630940',
    govVault: '0xfa767a19c0c2b80d5a8d5b88be67de153df1b2f2',
  },
}

const nullAddress = '0x0000000000000000000000000000000000000000'
const isAddress = address => /^0x[0-9a-fA-F]{40}$/.test(address)
const normalize = address => address.toLowerCase()
const uniqueAddresses = addresses => [...new Map(addresses.map(address => [normalize(address), address])).values()]

async function getRegistryAddress(api, chain, regId, label) {
  const { ripeHq } = config[chain]
  const address = await api.call({ target: ripeHq, abi: 'function getAddr(uint256 regId) view returns (address)', params: [regId] })
  if (!isAddress(address)) throw new Error(`Invalid ${label} returned by RipeHq for ${chain}: ${address}`)
  // A successful zero response means this registry id was not registered at the queried block.
  // RPC errors still propagate, so unavailable history cannot silently shrink TVL.
  if (normalize(address) === nullAddress) return

  const reverseId = await api.call({ target: ripeHq, abi: 'function getRegId(address addr) view returns (uint256)', params: [address] })
  if (BigInt(reverseId) !== BigInt(regId)) throw new Error(`Invalid ${label} registry id for ${chain}: ${reverseId}`)
  return address
}

async function getEndaomentOwners(api, chain) {
  const { ripeHq, sweepEndaoment } = config[chain]
  const regId = RIPE_REGISTRY_IDS.sweepEndaoment
  const [currentEndaoment, updates] = await Promise.all([
    getRegistryAddress(api, chain, regId, 'Endaoment'),
    api.block < sweepEndaoment.fromBlock ? [] : getLogs2({
      api,
      target: ripeHq,
      fromBlock: sweepEndaoment.fromBlock,
      eventAbi: ADDRESS_UPDATE_CONFIRMED_EVENT,
      extraKey: 'sweep-endaoment-address-history',
    }),
  ])
  const historicalEndaoments = updates
    .filter(({ regId: updatedRegId }) => BigInt(updatedRegId) === BigInt(regId))
    .flatMap(({ newAddr, prevAddr }) => [newAddr, prevAddr])
    .filter(address => normalize(address) !== nullAddress)
  if (historicalEndaoments.some(address => !isAddress(address)))
    throw new Error(`Invalid historical Endaoment returned by RipeHq for ${chain}`)

  // Registry updates and asset sweeps are separate transactions. Unioning every on-chain version
  // with the block-specific result covers the interval where an old Endaoment still has custody.
  return uniqueAddresses([...historicalEndaoments, ...(currentEndaoment ? [currentEndaoment] : [])])
}

async function getTvlData(chain, endaomentOwners, block) {
  const chainConfig = config[chain]
  const [assetsResponse, addressesResponse] = await Promise.all([
    getConfig(chainConfig.assetsCacheKey, chainConfig.assetsUrl),
    getConfig(chainConfig.addressesCacheKey, chainConfig.addressesUrl),
  ])
  if (!Array.isArray(assetsResponse?.result)) throw new Error(`Invalid Ripe asset response for ${chain}`)
  if (addressesResponse?.chain !== chain || typeof addressesResponse?.addresses !== 'object')
    throw new Error(`Invalid Ripe address response for ${chain}`)

  const assets = assetsResponse.result
  const addresses = addressesResponse.addresses
  if (assets.some(({ tokenAddress, vaultId }) => !isAddress(tokenAddress) || !Number.isInteger(Number(vaultId))))
    throw new Error(`Invalid Ripe asset metadata for ${chain}`)
  if (![addresses.GreenToken, addresses.SavingsGreen, addresses.RipeHq, addresses.StabilityPool].every(isAddress))
    throw new Error(`Invalid Ripe registry address for ${chain}`)
  if (normalize(addresses.RipeHq) !== normalize(chainConfig.ripeHq))
    throw new Error(`Unexpected RipeHq returned by address API for ${chain}`)

  const stabilityPoolAssets = assets.filter(({ vaultId }) => Number(vaultId) === 1)
  const stabilityPoolAddress = stabilityPoolAssets[0]?.vaultAddress
  if (!isAddress(stabilityPoolAddress) || normalize(stabilityPoolAddress) !== normalize(addresses.StabilityPool))
    throw new Error(`Missing Ripe stability pool for ${chain}`)
  if (stabilityPoolAssets.some(({ vaultAddress }) => !isAddress(vaultAddress) || normalize(vaultAddress) !== normalize(stabilityPoolAddress)))
    throw new Error(`Inconsistent Ripe stability pool for ${chain}`)

  const historicalTokenFromBlocks = chainConfig.historicalTokenFromBlocks ?? {}
  const nonSpAssets = assets.filter(({ tokenAddress, vaultId }) =>
    Number(vaultId) > 2 && block >= (historicalTokenFromBlocks[normalize(tokenAddress)] ?? chainConfig.fromBlock))
  if (nonSpAssets.some(({ tokenAddress, vaultAddress, shouldTransferToEndaoment }) =>
    !isAddress(tokenAddress) || !isAddress(vaultAddress) || typeof shouldTransferToEndaoment !== 'boolean'))
    throw new Error(`Invalid Ripe collateral metadata for ${chain}`)
  if (nonSpAssets.some(({ vaultAddress }) => normalize(vaultAddress) === normalize(stabilityPoolAddress)))
    throw new Error(`Ripe stability pool appears in vaultId > 2 set for ${chain}`)

  const pairs = new Map()
  for (const { tokenAddress, vaultAddress, shouldTransferToEndaoment } of nonSpAssets) {
    // AuctionHouse currently sends liquidation proceeds to excluded Endaoment Funds and credits
    // stability-pool users via claimableBalances. This extra owner read is retained only as cheap
    // insurance against a future routing change; no current collateral path into the pool was found.
    const owners = [vaultAddress, stabilityPoolAddress]
    if (shouldTransferToEndaoment === true) owners.push(...endaomentOwners)
    for (const owner of owners)
      pairs.set(`${normalize(tokenAddress)}:${normalize(owner)}`, [tokenAddress, owner])
  }

  const configuredExclusions = [
    ...chainConfig.erc4626Wrappers.map(({ wrapper }) => wrapper),
    ...(chainConfig.unbackedWrappers ?? []),
    ...(chainConfig.excludePricedVault4Memecoins ? Object.values(chainConfig.pricedVault4Memecoins) : []),
  ]
  const blacklistedTokens = uniqueAddresses([
    addresses.GreenToken,
    addresses.SavingsGreen,
    ...assets.filter(({ vaultId }) => Number(vaultId) <= 1).map(({ tokenAddress }) => tokenAddress),
    ...configuredExclusions,
  ])
  if (blacklistedTokens.some(address => !isAddress(address))) throw new Error(`Invalid Ripe blacklist for ${chain}`)

  return { blacklistedTokens, stabilityPoolAddress, tokensAndOwners: [...pairs.values()] }
}

async function getHeldERC4626Shares(api, holdings) {
  if (!holdings.length) return []
  const shareBalances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: holdings.map(({ wrapper, owner }) => ({ target: wrapper, params: [owner] })),
    permitFailure: false,
  })
  return holdings
    .map((holding, i) => ({ ...holding, shares: shareBalances[i] }))
    .filter(({ shares }) => BigInt(shares) > 0n)
}

function getApiTokenBalance(api, token) {
  const normalizedToken = normalize(token)
  return Object.entries(api.getBalances())
    .filter(([key]) => normalize(key) === normalizedToken || normalize(key).endsWith(`:${normalizedToken}`))
    .reduce((sum, [, balance]) => sum + BigInt(balance), 0n)
}

async function unwrapERC4626Shares(api, heldShares, blacklistedTokens) {
  if (!heldShares.length) return new Set()

  const underlyingTokens = await api.multiCall({
    abi: 'address:asset',
    calls: heldShares.map(({ wrapper }) => wrapper),
    permitFailure: false,
  })
  heldShares.forEach(({ wrapper, underlying }, i) => {
    if (normalize(underlyingTokens[i]) !== normalize(underlying))
      throw new Error(`Unexpected ERC-4626 underlying for ${wrapper}: expected ${underlying}, got ${underlyingTokens[i]}`)
  })

  const underlyingBalances = await api.multiCall({
    abi: 'function convertToAssets(uint256 shares) view returns (uint256 assets)',
    calls: heldShares.map(({ wrapper, shares }) => ({ target: wrapper, params: [shares] })),
    permitFailure: false,
  })
  const blacklist = new Set(blacklistedTokens.map(normalize))
  const included = heldShares.map(({ wrapper, underlying }, i) => ({ wrapper, underlying, balance: underlyingBalances[i] }))
    .filter(({ underlying, balance }) => !blacklist.has(normalize(underlying)) && BigInt(balance) > 0n)
  const balancesBefore = included.map(({ underlying }) => getApiTokenBalance(api, underlying))
  api.addTokens(included.map(({ underlying }) => underlying), included.map(({ balance }) => balance))
  const addedWrappers = new Set()
  included.forEach(({ wrapper, underlying }, i) => {
    if (getApiTokenBalance(api, underlying) <= balancesBefore[i])
      throw new Error(`ERC-4626 wrapper ${wrapper} has non-zero shares but no underlying was added`)
    addedWrappers.add(normalize(wrapper))
  })
  return addedWrappers
}

async function addCurveLpExternalLegs(api, legs, owners, block) {
  const activeLegs = legs.filter(({ fromBlock }) => block >= fromBlock)
  if (!activeLegs.length) return

  const uniqueOwners = uniqueAddresses(owners)
  const holdings = activeLegs.flatMap((leg, legIndex) =>
    uniqueOwners.map(owner => ({ leg, legIndex, owner })))
  const lpBalances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: holdings.map(({ leg, owner }) => ({ target: leg.pool, params: [owner] })),
    permitFailure: false,
  })
  const heldByLeg = activeLegs.map(() => 0n)
  holdings.forEach(({ legIndex }, i) => { heldByLeg[legIndex] += BigInt(lpBalances[i]) })
  const heldLegs = activeLegs
    .map((leg, i) => ({ ...leg, heldShares: heldByLeg[i] }))
    .filter(({ heldShares }) => heldShares > 0n)
  if (!heldLegs.length) return

  const underlyingTokens = await api.multiCall({
    abi: 'function coins(uint256 index) view returns (address)',
    calls: heldLegs.map(({ pool, coinIndex }) => ({ target: pool, params: [coinIndex] })),
    permitFailure: false,
  })
  heldLegs.forEach(({ pool, underlying }, i) => {
    if (normalize(underlyingTokens[i]) !== normalize(underlying))
      throw new Error(`Unexpected Curve external leg for ${pool}: expected ${underlying}, got ${underlyingTokens[i]}`)
  })

  const [totalSupplies, poolBalances] = await Promise.all([
    api.multiCall({
      abi: 'erc20:totalSupply',
      calls: heldLegs.map(({ pool }) => pool),
      permitFailure: false,
    }),
    api.multiCall({
      abi: 'function balances(uint256 index) view returns (uint256)',
      calls: heldLegs.map(({ pool, coinIndex }) => ({ target: pool, params: [coinIndex] })),
      permitFailure: false,
    }),
  ])
  heldLegs.forEach(({ heldShares, pool, underlying }, i) => {
    const totalSupply = BigInt(totalSupplies[i])
    if (totalSupply === 0n) throw new Error(`Curve pool has held shares but zero supply: ${pool}`)
    api.add(underlying, (BigInt(poolBalances[i]) * heldShares / totalSupply).toString())
  })
}

function tvl(chain) {
  return async (api, block) => {
    const { curveLpExternalLegs, erc4626Wrappers } = config[chain]
    const endaomentOwners = await getEndaomentOwners(api, chain)
    const { blacklistedTokens, stabilityPoolAddress, tokensAndOwners } = await getTvlData(chain, endaomentOwners, block)
    const wrappers = new Map(erc4626Wrappers.map(wrapper => [normalize(wrapper.wrapper), wrapper]))
    const blacklist = new Set(blacklistedTokens.map(normalize))
    erc4626Wrappers.forEach(({ wrapper }) => {
      if (!blacklist.has(normalize(wrapper))) throw new Error(`ERC-4626 wrapper missing from ${chain} blacklist: ${wrapper}`)
    })

    // Follow Murk's third-party-share pattern: unwrap only Ripe's balance, never totalAssets().
    // The wrappers stay blacklisted from sumTokens2 but still enter this unwrap path; reversing that
    // distinction silently drops their underlying. It also prevents raw shares and assets both counting
    // if the share tokens receive prices later.
    const wrapperHoldings = tokensAndOwners.flatMap(([token, owner]) => {
      const wrapper = wrappers.get(normalize(token))
      return wrapper && block >= wrapper.fromBlock ? [{ ...wrapper, owner }] : []
    })
    const plainPairs = tokensAndOwners.filter(([token]) => !wrappers.has(normalize(token)))

    const heldWrapperShares = await getHeldERC4626Shares(api, wrapperHoldings)
    const addedWrappers = await unwrapERC4626Shares(api, heldWrapperShares, blacklistedTokens)
    heldWrapperShares.forEach(({ wrapper }) => {
      if (!addedWrappers?.has(normalize(wrapper)))
        throw new Error(`ERC-4626 wrapper ${wrapper} has non-zero shares but no underlying was added`)
    })
    await addCurveLpExternalLegs(api, curveLpExternalLegs, [stabilityPoolAddress, ...endaomentOwners], block)

    return sumTokens2({
      api,
      tokensAndOwners: plainPairs,
      blacklistedTokens,
    });
  }
}

function pool2Tvl(chain) {
  const { govVault, pool2Tokens } = config[chain]

  return async (api, block) => {
    const activeTokens = pool2Tokens
      .filter(({ fromBlock }) => block >= fromBlock)
      .map(({ token }) => token)
    if (!activeTokens.length) return api.getBalances()

    const endaomentOwners = await getEndaomentOwners(api, chain)
    const owners = [govVault, ...endaomentOwners]
    return sumTokens2({ api, owners, tokens: activeTokens, resolveLP: true })
  }
}

function borrowed(chain) {
  return async (api) => {
    const ledger = await getRegistryAddress(api, chain, RIPE_REGISTRY_IDS.ledger, 'Ledger')
    if (!ledger) return api.getBalances()
    const totalDebt = await api.call({ target: ledger, abi: 'uint256:totalDebt' })

    // GREEN debt is denominated in Ripe's $1 unit of account. DefiLlama reports CDP stablecoin
    // liabilities at face value; this is accounting treatment, not a price inferred from Ripe pools.
    const debtInMicroDollars = BigInt(totalDebt) / 10n ** 12n
    api.addUSDValue(Number(debtInMicroDollars) / 1e6)
  }
}

function afterDeployment(fromBlock, fn) {
  return async (api) => {
    const block = await api.getBlock()
    if (block < fromBlock) return api.getBalances()
    return fn(api, block)
  }
}

function chainExports(chain) {
  const { fromBlock, govVault, ripeToken, start } = config[chain]

  return {
    start,
    tvl: afterDeployment(fromBlock, tvl(chain)),
    pool2: afterDeployment(fromBlock, pool2Tvl(chain)),
    staking: afterDeployment(fromBlock, staking(govVault, ripeToken)),
    borrowed: afterDeployment(fromBlock, borrowed(chain)),
  }
}

const memecoinPolicy = config.robinhood.excludePricedVault4Memecoins ? 'exclude' : 'include'

module.exports = {
  methodology: config.robinhood.memecoinMethodologies[memecoinPolicy],
  misrepresentedTokens: false,
  base: chainExports('base'),
  robinhood: chainExports('robinhood'),
};
