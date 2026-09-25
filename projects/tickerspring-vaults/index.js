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

const abi = {
  // Depositor assets: unreserved idle tokens plus the LP position (loose tokens and liquidity at the pool price).
  // Excludes protocol/buyback fee reserves and uncollected LP fees.
  inventory: 'function inventory() view returns (uint256 a, uint256 b)',
}

async function tvl(api) {
  const [token0s, token1s, inventories] = await Promise.all([
    api.multiCall({ abi: 'address:token0', calls: vaults }),
    api.multiCall({ abi: 'address:token1', calls: vaults }),
    api.multiCall({ abi: abi.inventory, calls: vaults }),
  ])
  inventories.forEach(({ a, b }, i) => {
    api.add(token0s[i], a)
    api.add(token1s[i], b)
  })
}

module.exports = {
  methodology: 'TVL is the USDG and Stock Tokens held for depositors by the TickerSpring V7 vaults on Robinhood Chain, read on-chain from each vault\'s inventory(): unreserved idle balances plus the Uniswap position valued at the pool price. Protocol fee reserves and uncollected LP fees are excluded. The positions sit in Uniswap pools, so this TVL is also counted by the Uniswap adapter.',
  doublecounted: true,
  start: '2026-09-12', // all V7 vaults were deployed 2026-09-11 19:51-20:35 UTC
  robinhood: { tvl },
}
