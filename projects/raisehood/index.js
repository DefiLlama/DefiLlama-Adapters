const { sumTokens2 } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const FACTORY = '0xde540a7d140e27e50305fae78e736fe00f4a917f'
const NFT_MANAGERS = [
  '0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3', // Uniswap V3 NPM (Robinhood Chain)
  '0xd359160448B011dC1AAAF9C166e2e13bb414e6b3', // RobinSwap V3 NPM
]

const saleDataAbi = 'function getSaleData() view returns (tuple(address saleToken, address quoteToken, uint256 tokensPerQuoteUnit, uint256 softCap, uint256 hardCap, uint256 minBuy, uint256 maxBuy, uint64 startsAt, uint64 endsAt, bytes32 merkleRoot, uint16 tgeBps, uint64 cliffDuration, uint64 vestingDuration, address lpAdapter, uint16 lpBps, uint8 state, uint256 totalRaised, uint256 totalTokensSold, uint256 saleAllocation, uint64 finalizedAt, uint64 claimsOpenAt, bool deposited, bool cancelled, bool lpCreated, address projectOwner, uint256 quoteDecimalScale, uint256 platformFeeBps, bool escaped, bool closedEarly, uint8 pricingMode, address priceFeed, uint256 tokenPriceUsd, uint256 totalRaisedUsd, uint64 lpLockDuration, uint256 lpTokensAmount, bool burnUnsold))'

async function tvl(api) {
  const sales = await api.fetchList({ lengthAbi: 'uint256:allSalesLength', itemAbi: 'function allSales(uint256) view returns (address)', target: FACTORY })
  const lpLocker = await api.call({ abi: 'address:lpLocker', target: FACTORY })
  const saleData = await api.multiCall({ abi: saleDataAbi, calls: sales })

  const ownerTokens = saleData.map((d, i) => [[d.quoteToken], sales[i]])
  const quoteWhitelist = [...new Set(saleData.map(d => d.quoteToken === ADDRESSES.null ? ADDRESSES.robinhood.WETH : d.quoteToken))]

  return sumTokens2({
    api,
    ownerTokens,
    uniV3nftsAndOwners: NFT_MANAGERS.map(npm => [npm, lpLocker]),
    uniV3WhitelistedTokens: quoteWhitelist,
  })
}

module.exports = {
  methodology: 'Quote assets (ETH, USDG, tokenized stocks) escrowed in RaiseHood sale contracts during active raises, plus the locked V3 LP positions auto-seeded at settlement. Locked LP sits in Uniswap V3 / RobinSwap pools tracked separately, so doublecounted.',
  doublecounted: true,
  robinhood: { tvl },
}
