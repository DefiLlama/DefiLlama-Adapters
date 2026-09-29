// V7 vault inventory: https://tickerspring.com/docs#contracts
// Same cohort as dimension-adapters fees/tickerspring-vaults/deployments.ts. Earlier vault versions
// (listed with their balances at https://api.tickerspring.com/v1/public/vaults) hold no deposits.
const vaults = [
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

const { ethers } = require('ethers')
const { sumTokens2, addUniV3LikePosition } = require('../helper/unwrapLPs')

const V3_NPM = '0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3'
const V4_STATE_VIEW = '0xf3334192d15450cdd385c8b70e03f9a6bd9e673b'

const abi = {
  // Vault balances minus protocol/buyback fee reserves and quarantined tokens
  idle: 'function idle() view returns (uint256 a, uint256 b)',
  // V4 venues expose a V3-style positions() over a PoolManager position they own, salted with the tokenId
  key: 'function key() view returns (address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks)',
  positions: 'function positions(uint256) view returns (uint96 nonce, address operator, address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256, uint256, uint128, uint128)',
  getSlot0: 'function getSlot0(bytes32 poolId) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)',
  getPositionInfo: 'function getPositionInfo(bytes32 poolId, address owner, int24 tickLower, int24 tickUpper, bytes32 salt) view returns (uint128 liquidity, uint256, uint256)',
}

async function tvl(api) {
  const [token0s, token1s, idles, positions] = await Promise.all([
    api.multiCall({ abi: 'address:token0', calls: vaults }),
    api.multiCall({ abi: 'address:token1', calls: vaults }),
    api.multiCall({ abi: abi.idle, calls: vaults }),
    api.multiCall({ abi: 'address:position', calls: vaults }),
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
    else throw new Error(`Unknown position manager ${managers[i]} for vault ${vaults[i]}`)
  })

  const [keys, tokenIds] = await Promise.all([
    api.multiCall({ abi: abi.key, calls: v4.map(v => v.venue) }),
    api.multiCall({ abi: 'uint256:tokenId', calls: v4.map(v => v.position) }),
  ])
  const ranges = await api.multiCall({ abi: abi.positions, calls: v4.map((v, i) => ({ target: v.venue, params: [tokenIds[i]] })) })
  const poolIds = keys.map(k => ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(
    ['address', 'address', 'uint24', 'int24', 'address'], [k.currency0, k.currency1, k.fee, k.tickSpacing, k.hooks])))
  const [slot0s, infos] = await Promise.all([
    api.multiCall({ abi: abi.getSlot0, target: V4_STATE_VIEW, calls: poolIds }),
    api.multiCall({
      abi: abi.getPositionInfo, target: V4_STATE_VIEW, calls: v4.map(({ venue }, i) => ({
        params: [poolIds[i], venue, ranges[i].tickLower, ranges[i].tickUpper, ethers.zeroPadValue(ethers.toBeHex(tokenIds[i]), 32)],
      })),
    }),
  ])
  v4.forEach((_, i) => addUniV3LikePosition({
    api, token0: keys[i].currency0, token1: keys[i].currency1, liquidity: Number(infos[i].liquidity),
    tickLower: Number(ranges[i].tickLower), tickUpper: Number(ranges[i].tickUpper), tick: Number(slot0s[i].tick),
  }))

  return sumTokens2({ api, uniV3nftsAndOwners: v3Owners.map(owner => [V3_NPM, owner]) })
}

module.exports = {
  methodology: 'TVL is the USDG and Stock Tokens held for depositors by the TickerSpring V7 vaults on Robinhood Chain: each vault\'s idle balances net of protocol fee reserves, plus the liquidity of its Uniswap V3 NFT or Uniswap V4 PoolManager position, valued at the pool price. Uncollected LP fees are excluded. The positions sit in Uniswap pools, so this TVL is also counted by the Uniswap adapters.',
  doublecounted: true,
  start: '2026-09-12', // all V7 vaults were deployed 2026-09-11 19:51-20:35 UTC
  robinhood: { tvl },
}
