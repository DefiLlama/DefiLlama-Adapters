const ADDRESSES = require('../helper/coreAssets.json')
const { PublicKey } = require('@solana/web3.js')
const { Program } = require('@project-serum/anchor')
const bs58 = require('bs58').default || require('bs58')
const { WhirpoolIDL } = require('../armada/idl')
const { getConnection, getProvider, getTokenSupplies, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } = require('../helper/solana')
const { getConfig } = require('../helper/cache')
const { getLogs2 } = require('../helper/cache/getLogs')
const { addUniV3LikePosition } = require('../helper/unwrapLPs')
const { getContractInstanceStorage, callSoroban } = require('../helper/chain/stellar')

// PST/mPST deposits are lent on to Arf (Huma's cross-border payment arm) through Huma
// Institutional tranched pools, plus a liquid sleeve in Jupiter Lend / Orca / Pendle and
// TradeFlow trade-finance notes. Wallets and contracts are the ones Huma discloses on
// https://huma.accountable.capital - every balance and mark below is read on chain.

const HUMA_2 = 'HumaXepHnjaRCpjYTokxY4UtaJcmx41prQ8cxGmFC5fn'
const HUMA_INSTITUTIONAL = 'EVQ4s1b6N1vmWFDv8PRNc77kufBP8HcrSNWXQAhRsJq9'
const WHIRLPOOL_PROGRAM = 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc'
const PST = '59obFNBzyTBGowrkif5uK7ojS58vsuWz3ZCvg6tfZAGw'

// Anchor account discriminators (sha256("account:<name>")[0..8])
const DISC = {
  poolState: [247, 237, 227, 245, 215, 195, 222, 70],
  strategyManagerWallet: [7, 113, 185, 42, 183, 171, 232, 77],
  manualStrategyManager: [64, 224, 248, 213, 255, 189, 28, 193],
}

// Reserve custody not registered inside the Huma 2.0 program: a PDA of Huma's vault
// program (prm1azdDGzyqP76s3Hv2nuG3uLnBgR5u2d7pANwmmzC) holding the liquid sleeve.
const EXTRA_SOLANA_WALLETS = ['9936VFvgRmW1STvdgeyPQaKHDx5DwBtbhZkT3HcdL3QK']
// Receipt tokens the liquid sleeve is parked in. PST/mPST are excluded on purpose:
// they are Huma's own deposit receipts, counting them would be circular.
const LIQUID_TOKENS = [
  ADDRESSES.solana.USDC,
  '9BEcn9aPEmhSPbPQeFGjidRiEKki46fVQDyPpSQXPA2D', // jlUSDC, Jupiter Lend USDC
]

// Kamino Lend keeps deposits in an Obligation PDA, not a token account, so the reserve
// wallet scan cannot see them. Offsets: Obligation = disc(8) tag(8) last_update(16)
// lending_market(32) owner(32) deposits[8]. Reserve = header(128) liquidity(1232)
// padding(1200), so ReserveCollateral starts at 2560 and its mint_total_supply at 2592 -
// verified on chain: the mint at 2560 reports exactly the supply stored at 2592.
const KLEND = 'KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD'
const OBLIGATION_OWNER = 64
const OBLIGATION_DEPOSITS = 96
const OBLIGATION_COLLATERAL_SIZE = 136
const RESERVE_LIQUIDITY_MINT = 128
const RESERVE_AVAILABLE_AMOUNT = 224
const RESERVE_BORROWED_SF = 232
const RESERVE_PROTOCOL_FEES_SF = 344
const RESERVE_REFERRER_FEES_SF = 360
const RESERVE_PENDING_REFERRER_FEES_SF = 376
const RESERVE_COLLATERAL_SUPPLY = 2592
const SF = 2n ** 60n

const SAFE = '0xbf87D9244CD8E4d9F49d3b6016F784493b199b36'
const VAULT_V2_FACTORY = '0xA1D94F746dEfa1928926b84fB2596c06926C0405' // Morpho Vault V2 factory
const CMTAT_FACTORY = '0x1AEbACA03Da21eEadC474febCFA5140044A33f49' // Obligate eNote factory
const PENDLE_MARKETS = chainId => `https://api-v2.pendle.finance/core/v1/${chainId}/markets/active`
const STELLAR_POOL_STORAGE = 'CAADAYJOZF5HXPVZXBXA3PLCU7OSRW34OKVXG2676KAGZVZBI6EYQ73L'
const STELLAR_WALLET = 'GDY2SKUDNRGOOWMAQLDTBO4LNL6CMWHZRD3ZB55VOOM6MTXQ5Y5TRL6Q'

const readU128 = (data, offset) => Number(data.readBigUInt64LE(offset)) + Number(data.readBigUInt64LE(offset + 8)) * 2 ** 64

// PoolState: bump u8, status u8, tranche_addrs Vec<Option<Pubkey>>, current_epoch { u64, u64 },
// tranche_assets Vec<u128>, ... - tranche_assets is the pool's live mark for each tranche.
function decodePoolState(data) {
  let offset = 10
  const trancheCount = data.readUInt32LE(offset); offset += 4
  const mints = []
  for (let i = 0; i < trancheCount; i++) {
    if (data[offset++]) { mints.push(bs58.encode(data.subarray(offset, offset + 32))); offset += 32 }
    else mints.push(null)
  }
  offset += 16
  const assetCount = data.readUInt32LE(offset); offset += 4
  const assets = []
  for (let i = 0; i < assetCount; i++) { assets.push(readU128(data, offset)); offset += 16 }
  return { mints, assets }
}

const getProgramAccounts = (programId, discriminator) => getConnection()
  .getProgramAccounts(new PublicKey(programId), { filters: [{ memcmp: { offset: 0, bytes: bs58.encode(Buffer.from(discriminator)) } }] })

async function getSolanaWallets() {
  // Huma registers each strategy wallet on chain, so new ones are picked up automatically
  const accounts = [
    ...await getProgramAccounts(HUMA_2, DISC.strategyManagerWallet),
    ...await getProgramAccounts(HUMA_2, DISC.manualStrategyManager),
  ]
  const wallets = accounts.map(({ account }) => bs58.encode(account.data.subarray(9, 41)))
  return [...new Set([...wallets, ...EXTRA_SOLANA_WALLETS])]
}

// Every token account held by the reserve wallets, keyed by mint
async function getReserveTokens(wallets) {
  const holdings = {}
  for (const wallet of wallets) {
    for (const programId of [TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID]) {
      const { value } = await getConnection().getParsedTokenAccountsByOwner(new PublicKey(wallet), { programId })
      value.forEach(({ account }) => {
        const { mint, tokenAmount } = account.data.parsed.info
        holdings[mint] = (holdings[mint] ?? 0) + +tokenAmount.amount
      })
    }
  }
  return holdings
}

// Arf receivables: Huma holds the tranche tokens of the Huma Institutional pools that lend
// to Arf. Value them at the pool's own on-chain tranche mark, pro-rated by Huma's share.
async function addArfTranches(api, holdings) {
  const pools = (await getProgramAccounts(HUMA_INSTITUTIONAL, DISC.poolState)).map(({ account }) => decodePoolState(account.data))
  const held = pools.flatMap(({ mints, assets }) => mints
    .map((mint, i) => ({ mint, assets: assets[i] }))
    .filter(({ mint }) => mint && holdings[mint]))
  if (!held.length) throw new Error('huma-v2: no Arf tranche tokens found in reserve wallets')

  const supplies = await getTokenSupplies(held.map(i => i.mint))
  held.forEach(({ mint, assets }) => {
    const supply = supplies[mint]
    if (!supply) throw new Error(`huma-v2: no supply for tranche ${mint}`)
    api.add(ADDRESSES.solana.USDC, assets * holdings[mint] / supply)
  })
}

// Kamino Lend deposits are held as collateral shares inside an Obligation PDA owned by the
// reserve wallet; redeem them at the reserve's own cToken rate into its liquidity mint.
async function addKaminoDeposits(api, wallets) {
  const obligations = (await Promise.all(wallets.map(owner => getConnection()
    .getProgramAccounts(new PublicKey(KLEND), { filters: [{ memcmp: { offset: OBLIGATION_OWNER, bytes: owner } }] })))).flat()
  const shares = {}
  obligations.forEach(({ account: { data } }) => {
    for (let i = 0; i < 8; i++) {
      const offset = OBLIGATION_DEPOSITS + i * OBLIGATION_COLLATERAL_SIZE
      const reserve = data.subarray(offset, offset + 32)
      const amount = data.readBigUInt64LE(offset + 32)
      if (!amount || reserve.every(byte => !byte)) continue
      const key = bs58.encode(reserve)
      shares[key] = (shares[key] ?? 0n) + amount
    }
  })
  const reserves = Object.keys(shares)
  if (!reserves.length) return
  const accounts = await getConnection().getMultipleAccountsInfo(reserves.map(i => new PublicKey(i)))
  accounts.forEach((account, i) => {
    if (!account) throw new Error(`huma-v2: missing Kamino reserve ${reserves[i]}`)
    const { data } = account
    const scaled = offset => (Number(data.readBigUInt64LE(offset)) + Number(data.readBigUInt64LE(offset + 8)) * 2 ** 64) / Number(SF)
    const liquidity = Number(data.readBigUInt64LE(RESERVE_AVAILABLE_AMOUNT)) + scaled(RESERVE_BORROWED_SF)
      - scaled(RESERVE_PROTOCOL_FEES_SF) - scaled(RESERVE_REFERRER_FEES_SF) - scaled(RESERVE_PENDING_REFERRER_FEES_SF)
    const supply = Number(data.readBigUInt64LE(RESERVE_COLLATERAL_SUPPLY))
    if (!supply) return
    api.add(bs58.encode(data.subarray(RESERVE_LIQUIDITY_MINT, RESERVE_LIQUIDITY_MINT + 32)), Number(shares[reserves[i]]) * liquidity / supply)
  })
}

async function addOrcaPositions(api, holdings) {
  // Orca positions are held as NFTs; the position account is a PDA of the position mint
  const positionMints = Object.keys(holdings).filter(mint => holdings[mint] === 1)
  const positionKeys = positionMints.map(mint => PublicKey.findProgramAddressSync([Buffer.from('position'), new PublicKey(mint).toBuffer()], new PublicKey(WHIRLPOOL_PROGRAM))[0])
  const whirlpoolProgram = new Program(WhirpoolIDL, new PublicKey(WHIRLPOOL_PROGRAM), getProvider())
  const positions = (await whirlpoolProgram.account.position.fetchMultiple(positionKeys)).filter(i => i)
  if (!positions.length) return
  const whirlpoolKeys = positions.map(i => i.whirlpool)
  const whirlpools = await whirlpoolProgram.account.whirlpool.fetchMultiple(whirlpoolKeys)
  positions.forEach((position, i) => {
    const whirlpool = whirlpools[i]
    addUniV3LikePosition({
      api,
      token0: whirlpool.tokenMintA.toString(),
      token1: whirlpool.tokenMintB.toString(),
      liquidity: position.liquidity,
      tickLower: position.tickLowerIndex,
      tickUpper: position.tickUpperIndex,
      tick: whirlpool.tickCurrentIndex,
    })
  })
}

async function solanaTvl(api) {
  const wallets = await getSolanaWallets()
  const holdings = await getReserveTokens(wallets)
  LIQUID_TOKENS.forEach(token => { if (holdings[token]) api.add(token, holdings[token]) })
  await addArfTranches(api, holdings)
  await addKaminoDeposits(api, wallets)
  await addOrcaPositions(api, holdings)
  api.removeTokenBalance(`solana:${PST}`) // the Orca position is PST/USDC; its PST leg is Huma's own receipt token
  return api.getBalances()
}

async function ethereumTvl(api) {
  // TradeFlow notes are Obligate eNotes (CMTAT); enumerate every note the factory ever
  // minted and keep the ones Huma still holds
  const logs = await getLogs2({
    api,
    target: CMTAT_FACTORY,
    eventAbi: 'event CMTATProxyCreated(address indexed cmtatProxy)',
    fromBlock: 23675883,
  })
  const notes = logs.map(i => i.cmtatProxy)
  const noteBalances = await api.multiCall({ abi: 'erc20:balanceOf', calls: notes.map(target => ({ target, params: SAFE })), permitFailure: true })
  const owned = notes.map((note, i) => ({ note, balance: +noteBalances[i] })).filter(i => i.balance > 0)
  if (owned.length) {
    const calls = owned.map(i => i.note)
    const [decimals, debts, creditEvents] = await Promise.all([
      api.multiCall({ abi: 'erc20:decimals', calls }),
      api.multiCall({ abi: 'function debt() view returns (uint256 interestRate, uint256 parValue, string guarantor, string bondHolder, string maturityDate, string interestScheduleFormat, string interestPaymentDate, string dayCountConvention, string businessDayConvention, string publicHolidaysCalendar, string issuanceDate, string couponFrequency)', calls }),
      api.multiCall({ abi: 'function creditEvents() view returns (bool flagDefault, bool flagRedeemed, string rating)', calls }),
    ])
    const now = (api.timestamp ?? Date.now() / 1e3) * 1e3
    owned.forEach(({ balance }, i) => {
      const { flagDefault, flagRedeemed } = creditEvents[i]
      // a matured note is no longer a receivable - it is either repaid cash or bad debt
      if (flagDefault || flagRedeemed || new Date(debts[i].maturityDate).getTime() <= now) return
      api.add(ADDRESSES.ethereum.USDC, balance / 10 ** decimals[i] * +debts[i].parValue)
    })
  }

  // Liquid sleeve: Pendle PT/YT/SY/LP, Morpho vaults and plain stables. Huma rolls Pendle
  // positions on maturity and rotates between Morpho vaults, so enumerate both rather than
  // pinning addresses.
  const { markets } = await getConfig('pendle/markets-ethereum', PENDLE_MARKETS(1))
  const pendleTokens = markets.flatMap(({ pt, yt, sy, address }) => [pt, yt, sy, address].filter(i => i).map(i => i.split('-').pop()))
  const vaultLogs = await getLogs2({
    api,
    target: VAULT_V2_FACTORY,
    eventAbi: 'event CreateVaultV2(address indexed owner, address indexed asset, bytes32 salt, address indexed newVaultV2)',
    fromBlock: 23375073,
  })
  const morphoVaults = vaultLogs.map(i => i.newVaultV2)
  return api.sumTokens({ owner: SAFE, tokens: [...new Set([...pendleTokens, ...morphoVaults, ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.USDT, ADDRESSES.ethereum.sUSDS, ADDRESSES.ethereum.DAI, ADDRESSES.ethereum.sUSDe, ADDRESSES.ethereum.USDe])] })
}

// Huma's Pendle sUSDe sleeve on Monad is held as an LP: unwrap the Safe's share of the
// pool into the SY's yield token and the PT, then add any PT/YT it holds outright.
async function monadTvl(api) {
  const { markets } = await getConfig('pendle/markets-monad', PENDLE_MARKETS(143))
  const lps = markets.map(({ address }) => address.split('-').pop())
  const lpBalances = await api.multiCall({ abi: 'erc20:balanceOf', calls: lps.map(target => ({ target, params: SAFE })), permitFailure: true })
  const owned = lps.map((market, i) => ({ market, balance: +lpBalances[i] })).filter(i => i.balance > 0)
  if (owned.length) {
    const calls = owned.map(i => i.market)
    const [tokens, lpSupplies] = await Promise.all([
      api.multiCall({ abi: 'function readTokens() view returns (address _SY, address _PT, address _YT)', calls }),
      api.multiCall({ abi: 'erc20:totalSupply', calls }),
    ])
    const syCalls = tokens.map(i => i._SY)
    const [syInMarket, ptInMarket, yieldTokens, sySupplies] = await Promise.all([
      api.multiCall({ abi: 'erc20:balanceOf', calls: syCalls.map((target, i) => ({ target, params: calls[i] })) }),
      api.multiCall({ abi: 'erc20:balanceOf', calls: tokens.map((token, i) => ({ target: token._PT, params: calls[i] })) }),
      api.multiCall({ abi: 'function yieldToken() view returns (address)', calls: syCalls }),
      api.multiCall({ abi: 'erc20:totalSupply', calls: syCalls }),
    ])
    // SY is not always 1:1 with its yield token, so redeem through the SY's own backing
    const yieldInSy = await api.multiCall({ abi: 'erc20:balanceOf', calls: yieldTokens.map((target, i) => ({ target, params: syCalls[i] })) })
    owned.forEach(({ balance }, i) => {
      const share = balance / +lpSupplies[i]
      api.add(yieldTokens[i], +syInMarket[i] * share * +yieldInSy[i] / +sySupplies[i])
      api.add(tokens[i]._PT, +ptInMarket[i] * share)
    })
  }
  const pendleTokens = markets.flatMap(({ pt, yt }) => [pt, yt].filter(i => i).map(i => i.split('-').pop()))
  return api.sumTokens({ owner: SAFE, tokens: pendleTokens })
}

async function stellarTvl(api) {
  // Huma is an LP in the Soroban "Arf Pool"; value its tranche tokens at the pool's mark
  const { TrancheAddresses: { addrs }, TrancheAssets: { assets } } = await getContractInstanceStorage(STELLAR_POOL_STORAGE)
  for (const [i, tranche] of addrs.entries()) {
    const [balance, supply] = await Promise.all([
      callSoroban(tranche, 'balance', [STELLAR_WALLET]),
      callSoroban(tranche, 'total_supply'),
    ])
    if (!balance || !supply) continue
    api.addCGToken('usd-coin', Number(assets[i]) * Number(balance) / Number(supply) / 1e7)
  }
  return api.getBalances()
}

module.exports = {
  doublecounted: true, // the liquid sleeve sits inside Jupiter Lend, Kamino Lend, Orca and Pendle
  misrepresentedTokens: true, // receivables and notes are reported as their USDC face
  timetravel: false, // Solana and Soroban legs are current-state reads
  methodology: "Sums the reserves backing PST and mPST directly on chain, using the wallets and contracts Huma discloses on its Accountable dashboard: Arf receivables valued at the Huma Institutional pools' own tranche marks (Solana and Stellar), outstanding TradeFlow Obligate eNotes at par, and the liquid sleeve held in Jupiter Lend, Kamino Lend, Orca, Pendle (Ethereum and Monad) and stablecoins.",
  solana: { tvl: solanaTvl },
  ethereum: { tvl: ethereumTvl },
  monad: { tvl: monadTvl },
  stellar: { tvl: stellarTvl },
}
