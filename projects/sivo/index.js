// Sivo SLP — receivables-backed liquidity pool token priced by a Chainlink NAV feed.
// Deposited stablecoin is swept off-chain into receivables deployment, so
// TVL = SLP outstanding × SLP/USD NAV.

const SLP = '0xda6a067D9435a28549D75Dd459C0016911c26E54'
const CHAINLINK_SLP_USD = '0x0e095dD47bdE0d7cdb57a72bB98B6419dfBB505b'

async function tvl(api) {
  const [supply, slpDecimals, round, priceDecimals] = await Promise.all([
    api.call({ target: SLP, abi: 'erc20:totalSupply' }),
    api.call({ target: SLP, abi: 'erc20:decimals' }),
    api.call({ target: CHAINLINK_SLP_USD, abi: 'function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)' }),
    api.call({ target: CHAINLINK_SLP_USD, abi: 'uint8:decimals' }),
  ])
  api.addUSDValue((supply / 10 ** slpDecimals) * (round.answer / 10 ** priceDecimals))
}

module.exports = {
  misrepresentedTokens: true,
  methodology:
    'TVL is the total supply of SLP valued at the SLP/USD net asset value published by the Chainlink SLP/USD feed, which the protocol uses to price deposits and redemptions. Deposited USDC/USDT is deployed off-chain into short-duration receivables, so SLP supply × NAV represents the assets backing the pool.',
  start: 1788471503, // first round of the Chainlink SLP/USD feed (2026-09-03)
  ethereum: { tvl },
}
