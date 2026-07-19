const { nullAddress, sumTokens2 } = require('../helper/unwrapLPs')

/**
 * StonkBrokers — Anvil NFTFi market on Robinhood Chain.
 *
 * TVL sources:
 *  1. $STONKBROKER locked in the TokenEscrowReserve (AMM + loan buckets)
 *  2. ETH + stock tokens held by StockBooster (pending dividend drops)
 *  3. ETH held by ProtocolFeeSink
 *  4. Inventory NFTs in the AMM vault + collateral NFTs in the loan vault,
 *     valued at the vault's ethNotionalPerNFT oracle/fallback
 *
 * Spot Uniswap V4 ETH/STONKBROKER LP is intentionally excluded (already
 * counted under Uniswap).
 */
const STONKBROKER = '0xe934e36A439C94017B64a3FecE66AF12099aBF50'
const COLLECTION = '0x539CdD042c2f3d93EbC5BE7DfFf0c79F3B4fAbF0'
const ESCROW = '0x799AE26fA515ceF145e8bC8636F7fFF87B05Cf62'
const AMM_VAULT = '0xE302733accF4800146E55fC45B46b4E4fFC032D2'
const LOAN_VAULT = '0xa7B9AC696B252B79568A5a01b2Fd02177EF23664'
const STOCK_BOOSTER = '0x038a7F4E4E89448ad74e044337C9aC25C11e726B'
const FEE_SINK = '0x16027b596e210c63f750E0bdD156f00bb2749868'

// StockBooster dividend stocks (AAPL / AMZN / NVDA) + WETH dust
const BOOSTER_TOKENS = [
  nullAddress,
  '0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73', // WETH
  '0xaF3D76f1834A1d425780943C99Ea8A608f8a93f9', // AAPL
  '0x12f190a9F9d7D37a250758b26824B97CE941bF54', // AMZN
  '0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC', // NVDA
]

async function tvl(api) {
  // Escrow holds the AMM + loan $STONKBROKER float; fee sinks hold ETH/stocks.
  await sumTokens2({
    api,
    tokensAndOwners: [
      [STONKBROKER, ESCROW],
      [nullAddress, FEE_SINK],
      ...BOOSTER_TOKENS.map((t) => [t, STOCK_BOOSTER]),
    ],
  })

  const [ethNotional, inventoryCount, loanNfts] = await Promise.all([
    api.call({ target: AMM_VAULT, abi: 'uint256:ethNotionalPerNFT' }),
    api.call({ target: AMM_VAULT, abi: 'uint256:inventoryCount' }),
    api.call({ target: COLLECTION, abi: 'erc20:balanceOf', params: LOAN_VAULT }),
  ])

  const nftTvl = (BigInt(inventoryCount) + BigInt(loanNfts)) * BigInt(ethNotional)
  if (nftTvl > 0n) api.add(nullAddress, nftTvl.toString())
}

module.exports = {
  methodology:
    'TVL is $STONKBROKER locked in the Anvil NFTFi escrow, ETH/stock inventory in StockBooster and the protocol fee sink, plus AMM inventory and loan-collateral StonkBroker NFTs valued at ethNotionalPerNFT. Uniswap V4 spot LP is excluded to avoid double-counting.',
  robinhood: { tvl },
}
