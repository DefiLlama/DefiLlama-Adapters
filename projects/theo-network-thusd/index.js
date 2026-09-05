const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

// thUSD: yield-bearing stablecoin backed by thBILL and a hedged physical-gold carry book.
// TVL = circulating thUSD supply, built from the reserve side (same pattern as projects/ethena).
const thUSD   = '0xa3fE5c7596024E6811E14F029937D5bd8Ae485b3' // 6 decimals
const thBILL  = '0x5fa487bca6158c64046b2813623e20755091da0b' // 6 decimals, NAV via convertToAssets
const RESERVE = '0xEc417Ccb6dD26868Cca993a92F37217b1D4b3c2f' // thUSD reserve wallet

module.exports = {
  methodology:
    'thUSD TVL equals circulating thUSD supply, built from the reserve side. On-chain reserves held in the ' +
    'thUSD reserve wallet — thBILL (valued at thBILL contract NAV via convertToAssets, not market price), ' +
    'USDC and USDT — are reported as those assets. The remainder of supply is backed by physical gold ' +
    'purchased and leased through StoneX and Monetary Metals and hedged with CME gold futures, and is ' +
    'reported as thUSD. thBILL held in the reserve is also tracked by the Theo Network thBILL adapter, ' +
    'which is flagged doublecounted under the Theo Network parent.',
  hallmarks: [
    ['2026-04-27', 'thUSD reserve migrated to current reserve wallet'],
    ['2026-05-01', 'Gold carry strategy funded'],
  ],
  ethereum: {
    tvl: async (api) => {
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

      // 3. Off-chain gold reserves = supply not covered by on-chain reserves
      const onchainUsd = await api.getBalancesV2().getUSDValue()
      const offchain = supply - onchainUsd * 1e6
      if (offchain > 0) api.add(thUSD, offchain)
    },
  },
}
