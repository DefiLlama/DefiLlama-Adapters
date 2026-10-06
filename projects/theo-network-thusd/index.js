const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

// thUSD: yield-bearing stablecoin backed by thBILL and a hedged physical-gold carry book.
// TVL = circulating thUSD supply, built from the reserve side (same pattern as projects/ethena).
const thUSD   = '0xa3fE5c7596024E6811E14F029937D5bd8Ae485b3' // 6 decimals
const thBILL  = '0x5fa487bca6158c64046b2813623e20755091da0b' // 6 decimals, NAV via convertToAssets
const RESERVE = '0xEc417Ccb6dD26868Cca993a92F37217b1D4b3c2f' // thUSD reserve wallet
const thGOLD  = '0x610F0E33b0A6b3802ff29D3Cf6bBd9A0ACF784ed' // 6 decimals, 1 token = 1 troy ounce of gold
const thSLVR  = '0x84C8F334434fb6fF769F760653FEb88838357039' // 6 decimals, 1 token = 1 troy ounce of silver
const XAU_USD = '0x214eD9Da11D2fbe465a6fc601a91E62EbEc1a0D6' // Chainlink XAU/USD, 8 decimals
const XAG_USD = '0x379589227b15F1a12195D3f2d90bBc9F31f95235' // Chainlink XAG/USD, 8 decimals
const LATEST_ROUND = 'function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)'
const THGOLD_LIVE = 1789569060 // 2026-09-16, first thGOLD mint (contract deployed 2026-09-15)
const THSLVR_LIVE = 1790018220 // 2026-09-21, first thSLVR mint (contract deployed 2026-09-17)

async function reserveMetalUsd(api, token, feed) {
  const oz = await api.call({ abi: 'erc20:balanceOf', target: token, params: RESERVE })
  const { answer } = await api.call({ abi: LATEST_ROUND, target: feed })
  return (oz / 1e6) * (answer / 1e8)
}

module.exports = {
  start: '2026-04-09', // thUSD deployed 2026-04-08
  misrepresentedTokens: true, // metals are reported as a USD value, which the token breakdown labels USDT
  methodology:
    'thUSD TVL equals circulating thUSD supply, built from the reserve side. On-chain reserves held in the ' +
    'thUSD reserve wallet are reported as those assets: thBILL (valued at thBILL contract NAV via convertToAssets, ' +
    'not market price), thGOLD and thSLVR (each token one troy ounce, valued at the Chainlink XAU/USD and XAG/USD ' +
    'prices), and USDC and USDT. The remainder of supply is backed by physical gold and silver purchased and leased ' +
    'through StoneX and Monetary Metals that has not yet been tokenized, with the gold position hedged with CME gold ' +
    'futures, and is reported as thUSD. thBILL, thGOLD and ' +
    'thSLVR held in the reserve are also tracked by their own Theo Network adapters, which are flagged doublecounted ' +
    'under the Theo Network parent.',
  hallmarks: [
    ['2026-04-27', 'thUSD reserve migrated to current reserve wallet'],
    ['2026-05-01', 'Gold carry strategy funded'],
  ],
  ethereum: {
    tvl: async (api) => {
      // Every minted thUSD is issued to users: none is held in treasury or escrow, and staked
      // thUSD sits in the sthUSD vault while remaining user-owned, so totalSupply is circulating supply.
      const supply = await api.call({ abi: 'erc20:totalSupply', target: thUSD })

      // 1. Stablecoins held in the reserve wallet
      await sumTokens2({
        api,
        owner: RESERVE,
        tokens: [ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.USDT],
      })

      // 2. thBILL held in the reserve, at contract NAV
      const thbillBal = await api.call({ abi: 'erc20:balanceOf', target: thBILL, params: RESERVE })
      const thbillUsdc = await api.call({
        abi: 'function convertToAssets(uint256 shares) view returns (uint256)',
        target: thBILL,
        params: thbillBal,
      })
      api.add(ADDRESSES.ethereum.USDC, thbillUsdc)

      // 3. thGOLD and thSLVR held in the reserve, each token one troy ounce, at the Chainlink spot price.
      //    Both launched in September 2026; earlier dates skip them, since the contracts did not exist yet.
      const ts = api.timestamp ?? Date.now() / 1e3
      let metalsUsd = 0
      if (ts >= THGOLD_LIVE) metalsUsd += await reserveMetalUsd(api, thGOLD, XAU_USD)
      if (ts >= THSLVR_LIVE) metalsUsd += await reserveMetalUsd(api, thSLVR, XAG_USD)
      if (metalsUsd) api.addUSDValue(metalsUsd)

      // 4. Off-chain metal reserves = the remainder of supply not covered by on-chain reserves.
      //    Added unconditionally, as in projects/ethena, so the total is always exactly thUSD supply:
      //    were on-chain reserves ever to exceed supply, this residual goes negative and nets it back down.
      const onchainUsd = await api.getBalancesV2().getUSDValue()
      api.add(thUSD, supply - onchainUsd * 1e6)
    },
  },
}
