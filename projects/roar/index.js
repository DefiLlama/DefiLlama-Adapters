const ADDRESSES = require('../helper/coreAssets.json')

const GAME = '0xB9E308C0de769aB61089Ef47231f0ff92AE8BF69'
const AUTO_MINER = '0x451e9b91447bE0abeebD3110b8c372988383f72C'
const STAKING = '0xAB9E06E60AafE34257315c12717e0b9E5bFa7631'
const ROAR = '0xf1d3e39cc61Aedd53dc40d8AFFf6aA1dD51875D0'
const WETH = ADDRESSES.robinhood.WETH

async function tvl(api) {
  const [roundEscrow, outstandingSettlement, autoMinerEscrow] = await Promise.all([
    api.call({ target: GAME, abi: 'uint256:roundEscrowSettlement' }),
    api.call({ target: GAME, abi: 'uint256:totalRoundSettlementOutstanding' }),
    api.call({ target: AUTO_MINER, abi: 'uint256:totalEscrowLiability' }),
  ])

  api.add(WETH, BigInt(roundEscrow) + BigInt(outstandingSettlement) + BigInt(autoMinerEscrow))
}

async function staking(api) {
  const [liabilities, stakingBalance] = await Promise.all([
    api.call({
      target: GAME,
      abi: 'function liabilities() view returns (uint256 settlementLiability, uint256 rewardLiability)',
    }),
    api.call({ target: ROAR, abi: 'erc20:balanceOf', params: STAKING }),
  ])

  api.add(ROAR, BigInt(liabilities[1]) + BigInt(stakingBalance))
}

module.exports = {
  methodology: 'TVL counts only user-owned WETH liabilities: active-round escrow and unclaimed settlement rewards in the Game, plus prepaid automated-mining escrow in the canonical AutoMiner. Pending admin settlement, Treasury assets, and Giga LP liquidity are excluded. Staking counts the Game reward liability (unclaimed round rewards and the Motherlode) plus all ROAR held by the Staking contract as staked principal, earned rewards, and unvested rewards.',
  start: 1785423000, // after the canonical AutoMiner deployment
  robinhood: { tvl, staking },
}
