const ADDRESSES = require("../helper/coreAssets.json");

const LENDER = '0x4ed5c72816aBc1b67ac31DdAbE31cff4a8c56a15'
const SWAN = '0xD0a32F6d4850F9D6DF7d4F8f84af1Fcd3Cf993CC'
const STAKED_SWAN = '0xcBC108384e874D9B0436adE3918685BaA709e48c'

async function tvl(api) {
  // wstETH collateral + sUSDS PSM vault reserves
  return api.sumTokens({ owner: LENDER, tokens: [ADDRESSES.ethereum.WSTETH, ADDRESSES.ethereum.sUSDS] })
}

async function staking(api) {
  const staked = await api.call({ abi: 'erc20:totalSupply', target: STAKED_SWAN })
  api.add(SWAN, staked)
}

module.exports = {
  methodology: 'TVL is the wstETH collateral and the sUSDS PSM reserves held by the Swan DAO Monolith lender. Staking is the SWAN staked in sSWAN.',
  // the lender was deployed by the Monolith factory, so its collateral is also counted in monolith-market
  doublecounted: true,
  ethereum: { tvl, staking },
}
