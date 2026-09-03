const { sumTokens2 } = require('../helper/unwrapLPs');
const { getConfig } = require('../helper/cache');
const { staking } = require('../helper/staking')

const RIPE_REGISTRY_IDS = {
  ledger: 4,
  priceDesk: 7,
  // Points at the Endaoment holding swept collateral. Resolved at the queried block, which is
  // also correct for backfills.
  sweepEndaoment: 14,
}

const config = {
  base: {
    start: 1754006400,
    fromBlock: 32_085_883,
    // Underscore vault shares held as Ripe collateral: ERC-4626 wrappers with no price feed,
    // unwrapped to their underlying instead of being silently dropped by sumTokens2.
    erc4626Wrappers: [
      { wrapper: '0x99e65176f7fa8743e3fbaef277d1da448e361367', underlying: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913' }, // undyUSDC -> USDC
      { wrapper: '0x02981db1a99a14912b204437e7a2e02679b57668', underlying: '0x4200000000000000000000000000000000000006' }, // undyETH -> WETH
      { wrapper: '0x3fb0fc9d3ddd543ad1b748ed2286a022f4638493', underlying: '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf' }, // undyBTC -> cbBTC
      { wrapper: '0x1cb8dab80f19fc5aca06c2552aecd79015008ea8', underlying: '0x60a3e35cc302bfa44cb288bc5a4f316fdb1adb42' }, // undyEURC -> EURC
      { wrapper: '0x96f1a7ce331f40afe866f3b707c223e377661087', underlying: '0x940181a94a35a4569e4529a3cdfb74e38fd98631' }, // undyAERO -> AERO
    ],
    curveLpExternalLegs: [{
      pool: '0xd6c283655b42fa0eb2685f7ab819784f071459dc', // GREEN/USDC
      underlying: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', // USDC
      coinIndex: 0,
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
    start: 1785871180,
    fromBlock: 27_870_288,
    erc4626Wrappers: [],
    unbackedWrappers: [
      '0xb773ec2c326b7f98a5a83fc098825492f020a4c7', // sNET: no observable backing or conversion rate
    ],
    curveLpExternalLegs: [{
      pool: '0x2fd13b49f970e8c6d89283056c1c6281214b7eb6', // GREEN/USDG
      underlying: '0x5fc5360d0400a0fd4f2af552add042d716f1d168', // USDG
      coinIndex: 0,
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

// Resolves a RipeHq registry id at the queried block; zero address means not yet registered.
async function getRegistryAddress(api, chain, regId, label) {
  const address = await api.call({ target: config[chain].ripeHq, abi: 'function getAddr(uint256 regId) view returns (address)', params: [regId] })
  if (!isAddress(address)) throw new Error(`Invalid ${label} returned by RipeHq for ${chain}: ${address}`)
  if (normalize(address) === nullAddress) return
  return address
}

async function getEndaomentOwners(api, chain) {
  const endaoment = await getRegistryAddress(api, chain, RIPE_REGISTRY_IDS.sweepEndaoment, 'Endaoment')
  return endaoment ? [endaoment] : []
}

// Fetches Ripe's asset/address metadata and derives the TVL inputs: [token, owner] pairs for
// vaultId > 2 collateral, per-token LTV, and the blacklist. Throws on malformed responses
// rather than under-counting.
async function getTvlData(chain, endaomentOwners) {
  const chainConfig = config[chain]
  const [assetsResponse, addressesResponse] = await Promise.all([
    getConfig(`ripe-assets-${chain}`, `https://api.ripe.finance/api/ripe/assets?chain=${chain}`),
    getConfig(`ripe-addresses-${chain}`, `https://api.ripe.finance/api/chains/addresses?chain=${chain}`),
  ])
  if (!Array.isArray(assetsResponse?.result)) throw new Error(`Invalid Ripe asset response for ${chain}`)
  const addresses = addressesResponse?.addresses
  if (![addresses?.GreenToken, addresses?.SavingsGreen, addresses?.StabilityPool].every(isAddress))
    throw new Error(`Invalid Ripe registry address for ${chain}`)

  const assets = assetsResponse.result
  const stabilityPoolAddress = addresses.StabilityPool
  const nonSpAssets = assets.filter(({ vaultId }) => Number(vaultId) > 2)
  if (nonSpAssets.some(({ tokenAddress, vaultAddress, ltv }) =>
    !isAddress(tokenAddress) || !isAddress(vaultAddress) || !/^\d+$/.test(String(ltv))))
    throw new Error(`Invalid Ripe collateral metadata for ${chain}`)

  // The highest LTV across a token's vault entries decides whether it is borrowable at all.
  const tokenLtv = new Map()
  const pairs = new Map()
  for (const { tokenAddress, vaultAddress, shouldTransferToEndaoment, ltv } of nonSpAssets) {
    const key = normalize(tokenAddress)
    if (BigInt(ltv) > (tokenLtv.get(key) ?? -1n)) tokenLtv.set(key, BigInt(ltv))
    const owners = [vaultAddress, stabilityPoolAddress]
    if (shouldTransferToEndaoment === true) owners.push(...endaomentOwners)
    for (const owner of owners)
      pairs.set(`${key}:${normalize(owner)}`, [tokenAddress, owner])
  }

  const blacklistedTokens = uniqueAddresses([
    addresses.GreenToken,
    addresses.SavingsGreen,
    ...assets.filter(({ vaultId }) => Number(vaultId) <= 1).map(({ tokenAddress }) => tokenAddress).filter(isAddress),
    ...chainConfig.erc4626Wrappers.map(({ wrapper }) => wrapper),
    ...(chainConfig.unbackedWrappers ?? []),
  ])
  return { blacklistedTokens, stabilityPoolAddress, tokenLtv, tokensAndOwners: [...pairs.values()] }
}

// Drops collateral that Ripe itself treats as unproductive at the queried block: tokens whose
// highest LTV is zero AND whose on-chain PriceDesk mark is zero cannot be borrowed against and
// back no GREEN debt, so external marks (often derived from dust pools) would book value the
// protocol itself does not recognize. Fully dynamic: if Ripe later prices an asset or enables
// borrowing against it, it counts again, and future assets in the same shape are auto-excluded.
async function excludeUnproductiveTokens(api, chain, pairs, tokenLtv) {
  const zeroLtvTokens = uniqueAddresses(pairs.map(([token]) => token))
    .filter(token => (tokenLtv.get(normalize(token)) ?? 0n) === 0n)
  if (!zeroLtvTokens.length) return pairs

  const priceDesk = await getRegistryAddress(api, chain, RIPE_REGISTRY_IDS.priceDesk, 'PriceDesk')
  if (!priceDesk) return pairs
  // A revert for an asset PriceDesk does not know is the same signal as a zero mark.
  const prices = await api.multiCall({
    abi: 'function getPrice(address) view returns (uint256)',
    calls: zeroLtvTokens.map(token => ({ target: priceDesk, params: [token] })),
    permitFailure: true,
  })
  const excluded = new Set(zeroLtvTokens
    .filter((_, i) => prices[i] == null || BigInt(prices[i]) === 0n)
    .map(normalize))
  return pairs.filter(([token]) => !excluded.has(normalize(token)))
}

// Follows Murk's third-party-share pattern: unwrap only Ripe's share balance via
// balanceOf -> convertToAssets, never totalAssets(), which would credit Ripe with the
// wrapper's entire vault book.
async function unwrapERC4626Shares(api, holdings) {
  if (!holdings.length) return
  // permitFailure: a failed read means the wrapper is not deployed at this block, i.e. no shares.
  const shareBalances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: holdings.map(({ wrapper, owner }) => ({ target: wrapper, params: [owner] })),
    permitFailure: true,
  })
  const held = holdings
    .map((holding, i) => ({ ...holding, shares: shareBalances[i] }))
    .filter(({ shares }) => shares != null && BigInt(shares) > 0n)
  if (!held.length) return

  const underlyingTokens = await api.multiCall({ abi: 'address:asset', calls: held.map(({ wrapper }) => wrapper) })
  held.forEach(({ wrapper, underlying }, i) => {
    if (normalize(underlyingTokens[i]) !== normalize(underlying))
      throw new Error(`Unexpected ERC-4626 underlying for ${wrapper}: got ${underlyingTokens[i]}`)
  })
  const underlyingBalances = await api.multiCall({
    abi: 'function convertToAssets(uint256 shares) view returns (uint256 assets)',
    calls: held.map(({ wrapper, shares }) => ({ target: wrapper, params: [shares] })),
  })
  api.addTokens(held.map(({ underlying }) => underlying), underlyingBalances)
}

// Credits the external (non-GREEN) leg of each configured Curve pool pro-rata to the LP share
// the owners hold. The GREEN leg is protocol-minted and excluded.
async function addCurveLpExternalLegs(api, legs, owners) {
  const uniqueOwners = uniqueAddresses(owners)
  for (const { pool, underlying, coinIndex } of legs) {
    // permitFailure: a failed read means the pool is not deployed at this block, i.e. no shares.
    const lpBalances = await api.multiCall({
      abi: 'erc20:balanceOf',
      calls: uniqueOwners.map(owner => ({ target: pool, params: [owner] })),
      permitFailure: true,
    })
    const heldShares = lpBalances.reduce((sum, balance) => sum + BigInt(balance ?? 0), 0n)
    if (heldShares === 0n) continue

    const [coin, totalSupply, poolBalance] = await Promise.all([
      api.call({ abi: 'function coins(uint256) view returns (address)', target: pool, params: [coinIndex] }),
      api.call({ abi: 'erc20:totalSupply', target: pool }),
      api.call({ abi: 'function balances(uint256) view returns (uint256)', target: pool, params: [coinIndex] }),
    ])
    if (normalize(coin) !== normalize(underlying))
      throw new Error(`Unexpected Curve external leg for ${pool}: got ${coin}`)
    api.add(underlying, (BigInt(poolBalance) * heldShares / BigInt(totalSupply)).toString())
  }
}

function tvl(chain) {
  return async (api) => {
    const { curveLpExternalLegs, erc4626Wrappers } = config[chain]
    const endaomentOwners = await getEndaomentOwners(api, chain)
    const { blacklistedTokens, stabilityPoolAddress, tokenLtv, tokensAndOwners } = await getTvlData(chain, endaomentOwners)

    // Wrapper shares stay blacklisted from sumTokens2 (no price feed, and no double count if
    // they get one later) but enter the unwrap path instead of being dropped.
    const wrappers = new Map(erc4626Wrappers.map(wrapper => [normalize(wrapper.wrapper), wrapper]))
    const wrapperHoldings = tokensAndOwners.flatMap(([token, owner]) => {
      const wrapper = wrappers.get(normalize(token))
      return wrapper ? [{ ...wrapper, owner }] : []
    })
    const plainPairs = await excludeUnproductiveTokens(
      api, chain, tokensAndOwners.filter(([token]) => !wrappers.has(normalize(token))), tokenLtv)

    await unwrapERC4626Shares(api, wrapperHoldings)
    await addCurveLpExternalLegs(api, curveLpExternalLegs, [stabilityPoolAddress, ...endaomentOwners])

    return sumTokens2({ api, tokensAndOwners: plainPairs, blacklistedTokens })
  }
}

function pool2Tvl(chain) {
  const { govVault, pool2Tokens } = config[chain]

  return async (api, block) => {
    const activeTokens = pool2Tokens
      .filter(({ fromBlock }) => block >= fromBlock)
      .map(({ token }) => token)
    if (!activeTokens.length) return api.getBalances()

    const owners = [govVault, ...await getEndaomentOwners(api, chain)]
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
    api.addUSDValue(Number(BigInt(totalDebt) / 10n ** 12n) / 1e6)
  }
}

// Blocks before the chain's deployment return empty balances instead of calling
// contracts that do not exist yet.
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

module.exports = {
  methodology:
    "TVL is third-party collateral deposited in Ripe's vaults. " +
    'Collateral the protocol itself treats as unproductive is excluded dynamically: any asset whose ' +
    "on-chain PriceDesk mark is zero and whose LTV is zero (it cannot be borrowed against and backs no " +
    'GREEN debt) does not count. Underscore vault shares held as ' +
    'collateral are unwrapped to their ERC-4626 underlying. GREEN, sGREEN and the GREEN legs of the ' +
    "protocol's Curve pools (including stability-pool deposits) are excluded as protocol-minted, " +
    'following the Liquity treatment; only the external USDC/USDG legs count. Staking is RIPE held in ' +
    'the governance vault at market marks — note RIPE and GREEN are priced from pools Ripe itself ' +
    'predominantly owns. Pool2 unwraps RIPE-paired LPs to constituent reserves. Borrowed is ' +
    "outstanding GREEN debt from the Ledger at $1 face value.",
  base: chainExports('base'),
  robinhood: chainExports('robinhood'),
};
