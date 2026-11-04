const ADDRESSES = require('../helper/coreAssets.json')

// https://github.com/BrighterProtocol/brighter-contracts
const USDb = '0x0f4F28Ff93132AfF25506fc5F970eF9F48A6a96E' // USDb stablecoin (18 decimals), minted 1:1 against USDC by the USDbConverter PSM
const LIT_STAKING_POOL = '0x9520e4627320914c57f786D3Bd7EeD78D343294f' // stLIT (sLITb) staking pool
const LIT = '0x232CE3bd40fCd6f80f3d55A522d03f25Df784Ee2'

async function tvl(api) {
  // USDC deposited through the USDbConverter is bridged to Lighter (LLP) and USDb is minted 1:1;
  // the BrighterVault mints/burns USDb on every settlement to track realised trading PnL,
  // so USDb supply = USD value of all user capital in the system. Counted as USDC (18 -> 6 decimals).
  const usdbSupply = await api.call({ target: USDb, abi: 'erc20:totalSupply' })
  api.add(ADDRESSES.ethereum.USDC, usdbSupply / 1e12)

  // LIT staked through the pool is bridged to Lighter staking; pool accounting tracks it on-chain:
  // active stake + stake queued for the next round + LIT owed to pending unstake requests.
  const [staked, pending, reserved] = await Promise.all(
    ['totalStakedLit', 'pendingStakeLit', 'reservedForUnstake'].map((fn) => api.call({ target: LIT_STAKING_POOL, abi: `uint256:${fn}` }))
  )
  ;[staked, pending, reserved].forEach((amount) => api.add(LIT, amount))
}

module.exports = {
  methodology: 'TVL is the USDb total supply (valued 1:1 as USDC; USDb is minted against USDC deposits and re-marked to the Lighter LLP position at each settlement) plus LIT staked in the Brighter LIT staking pool (active + queued + pending unstake), all read from Brighter contracts on Ethereum. Deposited USDC and LIT are bridged to Lighter, where they are deployed in the Lighter LLP and LIT staking, so this TVL overlaps with Lighter LLP.',
  misrepresentedTokens: true,
  doublecounted: true,
  start: '2026-09-29',
  ethereum: { tvl },
}
