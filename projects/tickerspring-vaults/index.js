// Vaults that replaced V7 (the audited release, live 2026-10-23), one per pool on Uniswap V3, Uniswap V4, Up or Ramses.
// Each is deployed directly by the TickerSpring admin wallet (no factory), so the list comes from the TickerSpring API;
// every balance is read on-chain.
const VAULTS_API = 'https://api.tickerspring.com/v1/merged/vaults'

// V7 vault inventory: https://tickerspring.com/docs#contracts
// Same cohort as dimension-adapters fees/tickerspring-vaults/deployments.ts. Their holders are moving to the vaults
// above; a V7 vault that everyone has left keeps no position.
const v7Vaults = [
  '0xF8DE3bC8F4e577Bc59f166b1DAA391c8C69c73D5', // AMZN
  '0x5eaD63f22B2cF752d0F4aE4bcA2BD51cf83A641e', // AAPL
  '0x6bAb969D9927c8B17BC9dd42851c7b96E014532d', // AMD
  '0xB20bb3f29cd2f85cF06C240cE3302698e27f221d', // CRCL
  '0x9A8D2bB5684D03aa661B86859b960eF9BBe5087b', // GME
  '0x605829eEb18BDdA45FC165A9d0cc19bFDEbF3A02', // GOOGL
  '0x70752181e01197bD2e52575d03b9c323ea8f26Bd', // INTC
  '0xE0d7196D0e7Bdd3b53a11970a4edfa327DB76456', // META
  '0x387f9820DB494eC1fAeb9105a3c9E6226caCb057', // MSFT
  '0x2f936437A681b89cccd98a74f02Ee5779F6B559D', // MSTR
  '0x3BB0a114C2e491520806d9a546e1D7f354241026', // MU
  '0xc5aF3186b7b207beDd865eCcf344F5f0C69CA876', // NVDA
  '0xD72F1596Bf2b787af95cfe2BBF792B75ADE9400c', // PLTR
  '0x3f70f06D6fB574731e789Ee03DFa4E8f60783dDf', // QQQ
  '0x8197D34E8ed1d261aC462d898083eCBf8d5254b9', // SNDK
  '0x03504EcAEB6302db390Aa676A2636cf764f279a2', // SPCX
  '0x21ff4df049143dC698761a07949bd3e769aA3787', // SPY
  '0x78814fdC1AfD07ae859409F44B5D57DeA6798eF6', // TSLA
]

const ADDRESSES = require('../helper/coreAssets.json')
const { ethers } = require('ethers')
const { getConfig } = require('../helper/cache')
const { sumTokens2, addUniV3LikePosition } = require('../helper/unwrapLPs')

const V3_NPM = '0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3'
const V4_STATE_VIEW = '0xf3334192d15450cdd385c8b70e03f9a6bd9e673b'

const abi = {
  // V7 vault balances minus protocol/buyback fee reserves and quarantined tokens
  idle: 'function idle() view returns (uint256 a, uint256 b)',
  // V7 V4 venues expose a V3-style positions() over a PoolManager position they own, salted with the tokenId
  key: 'function key() view returns (address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks)',
  positions: 'function positions(uint256) view returns (uint96 nonce, address operator, address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256, uint256, uint128, uint128)',
  getSlot0: 'function getSlot0(bytes32 poolId) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)',
  getPositionInfo: 'function getPositionInfo(bytes32 poolId, address owner, int24 tickLower, int24 tickUpper, bytes32 salt) view returns (uint128 liquidity, uint256, uint256)',
  // Vaults: per-token protocol and buyback fee reserves, which are not depositors' assets
  protocolFees: 'function protocolFees(address token) view returns (uint256)',
  buybackFees: 'function buybackFees(address token) view returns (uint256)',
  // Vault venues: the vault's liquidity position and its pool's current price
  position: 'function position() view returns (int24 tickLower, int24 tickUpper, uint128 liquidity)',
  spot: 'function spot() view returns (uint160 sqrtPriceX96, int24 tick)',
}

// Adds the idle balances and V4 positions; returns the owners of V3 position NFTs
async function addV7Vaults(api) {
  const [token0s, token1s, idles, positions] = await Promise.all([
    api.multiCall({ abi: 'address:token0', calls: v7Vaults }),
    api.multiCall({ abi: 'address:token1', calls: v7Vaults }),
    api.multiCall({ abi: abi.idle, calls: v7Vaults }),
    api.multiCall({ abi: 'address:position', calls: v7Vaults }),
  ])
  idles.forEach(({ a, b }, i) => {
    api.add(token0s[i], a)
    api.add(token1s[i], b)
  })

  const [pools, managers] = await Promise.all([
    api.multiCall({ abi: 'address:pool', calls: positions }),
    api.multiCall({ abi: 'address:manager', calls: positions }),
  ])
  const v3Owners = []
  const v4 = []
  positions.forEach((position, i) => {
    if (managers[i] === V3_NPM) v3Owners.push(position)
    else if (managers[i] === pools[i]) v4.push({ position, venue: pools[i] })
    else throw new Error(`Unknown position manager ${managers[i]} for vault ${v7Vaults[i]}`)
  })

  // tokenId 0: the PoolManager position was closed (positions(0) reverts)
  const tokenIds = await api.multiCall({ abi: 'uint256:tokenId', calls: v4.map(v => v.position) })
  const open = v4.map((v, i) => ({ ...v, tokenId: tokenIds[i] })).filter(v => Number(v.tokenId) !== 0)
  const [keys, ranges] = await Promise.all([
    api.multiCall({ abi: abi.key, calls: open.map(v => v.venue) }),
    api.multiCall({ abi: abi.positions, calls: open.map(v => ({ target: v.venue, params: [v.tokenId] })) }),
  ])
  const poolIds = keys.map(k => ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(
    ['address', 'address', 'uint24', 'int24', 'address'], [k.currency0, k.currency1, k.fee, k.tickSpacing, k.hooks])))
  const [slot0s, infos] = await Promise.all([
    api.multiCall({ abi: abi.getSlot0, target: V4_STATE_VIEW, calls: poolIds }),
    api.multiCall({
      abi: abi.getPositionInfo, target: V4_STATE_VIEW, calls: open.map(({ venue, tokenId }, i) => ({
        params: [poolIds[i], venue, ranges[i].tickLower, ranges[i].tickUpper, ethers.zeroPadValue(ethers.toBeHex(tokenId), 32)],
      })),
    }),
  ])
  open.forEach((_, i) => addUniV3LikePosition({
    api, token0: keys[i].currency0, token1: keys[i].currency1, liquidity: Number(infos[i].liquidity),
    tickLower: Number(ranges[i].tickLower), tickUpper: Number(ranges[i].tickUpper), tick: Number(slot0s[i].tick),
  }))

  return v3Owners
}

async function addVaults(api) {
  const listed = (await getConfig('tickerspring-vaults', VAULTS_API)).data.vaults.map(v => v.vault)
  // A vault deployed after the queried block has no code yet
  const venues = await api.multiCall({ abi: 'address:venue', calls: listed, permitFailure: true })
  const vaults = listed.filter((_, i) => venues[i])
  const live = venues.filter(Boolean)
  const [usdgs, tokens, rewardTokens, token0s, token1s, positions, spots] = await Promise.all([
    api.multiCall({ abi: 'address:usdg', calls: vaults }),
    api.multiCall({ abi: 'address:token', calls: vaults }),
    api.multiCall({ abi: 'address:rewardToken', calls: vaults }),
    api.multiCall({ abi: 'address:token0', calls: live }),
    api.multiCall({ abi: 'address:token1', calls: live }),
    api.multiCall({ abi: abi.position, calls: live }),
    api.multiCall({ abi: abi.spot, calls: live }),
  ])

  // USDG, the pool token and (Up and Ramses vaults) the UP or RAM reward, net of the fee reserves;
  // USDG waiting for a deposit fill is included
  const holdings = vaults.flatMap((vault, i) => [usdgs[i], tokens[i], rewardTokens[i]]
    .filter(token => token !== ADDRESSES.null).map(token => ({ vault, token })))
  const [balances, protocolFees, buybackFees] = await Promise.all([
    api.multiCall({ abi: 'erc20:balanceOf', calls: holdings.map(({ vault, token }) => ({ target: token, params: [vault] })) }),
    api.multiCall({ abi: abi.protocolFees, calls: holdings.map(({ vault, token }) => ({ target: vault, params: [token] })) }),
    api.multiCall({ abi: abi.buybackFees, calls: holdings.map(({ vault, token }) => ({ target: vault, params: [token] })) }),
  ])
  holdings.forEach(({ token }, i) => {
    const held = BigInt(balances[i]) - BigInt(protocolFees[i]) - BigInt(buybackFees[i])
    if (held > 0n) api.add(token, held)
  })

  live.forEach((_, i) => addUniV3LikePosition({
    api, token0: token0s[i], token1: token1s[i], liquidity: Number(positions[i].liquidity),
    tickLower: Number(positions[i].tickLower), tickUpper: Number(positions[i].tickUpper), tick: Number(spots[i].tick),
  }))
}

async function tvl(api) {
  const v3Owners = await addV7Vaults(api)
  await addVaults(api)
  return sumTokens2({ api, uniV3nftsAndOwners: v3Owners.map(owner => [V3_NPM, owner]) })
}

module.exports = {
  methodology: 'TVL is the tokens held for depositors by the TickerSpring vaults on Robinhood Chain: the vaults listed by https://api.tickerspring.com/v1/merged/vaults (one per pool on Uniswap V3, Uniswap V4, Up or Ramses) and the V7 vaults their holders are moving from. Each vault counts its USDG, Stock Token or other pool token, and reward token balances net of protocol fee reserves, plus the liquidity of its pool position valued at the pool\'s current tick. Uncollected LP fees are excluded. The positions sit in Uniswap, Up and Ramses pools, so this TVL is also counted by those DEX adapters.',
  doublecounted: true,
  start: '2026-09-12', // all V7 vaults were deployed 2026-09-11 19:51-20:35 UTC
  robinhood: { tvl },
}
