// IXS 2.0 on Robinhood Chain. Separate from the IXS1 adapter (projects/ixswap), which is unchanged.
//
// ICEQ is minted by IXS against investor funds received off-chain and held in custody: the full
// supply sits in a Fireblocks vault co-signed by investors. ICEQ trades nowhere, so it has no
// market price. Its value comes from the ICEQ / USD NAV feed IXS publishes on-chain in Chainlink
// AggregatorV3 format (8 decimals). TVL = ICEQ total supply x NAV per token.
const ICEQ = '0xA9b4Ab774bB7A0e234Eec7358F6C69Ebf59Da21d'
const ICEQ_NAV_FEED = '0x45Ce0241e23b1A96F40078CFb73D5A1c95126c99'

async function tvl(api) {
  const [supply, decimals, round] = await Promise.all([
    api.call({ target: ICEQ, abi: 'erc20:totalSupply' }),
    api.call({ target: ICEQ, abi: 'erc20:decimals' }),
    api.call({ target: ICEQ_NAV_FEED, abi: 'function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)' }),
  ])
  const usd = BigInt(supply) * BigInt(round.answer) / 10n ** BigInt(decimals) / 10n ** 8n
  api.addUSDValue(Number(usd))
}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL is the total supply of ICEQ times its NAV per token, read from the ICEQ / USD NAV feed (Chainlink AggregatorV3 format, 8 decimals) that IXS publishes on Robinhood Chain. ICEQ is minted by IXS against investor funds received off-chain; the full supply is held in a Fireblocks custody vault co-signed by investors.',
  robinhood: { tvl },
}
