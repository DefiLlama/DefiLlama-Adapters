const sdk = require('@defillama/sdk');

const dataProviderAbi = require('./dataProvider.json');

const COVENANT = '0x11a7ab0a9d7bd531dbcf0f0630bf7167f8f198f6';
const DATA_PROVIDER = '0x3818a6d5018aa9eb69b6bce09e38a7c24bbe8c22';
const DEPLOY_BLOCK = 35851140;
const CHAIN = 'monad';

const NATIVE_MON = '0x0000000000000000000000000000000000000000';
const USD_CG_ID = 'usd-coin'; // attributed via api.addCGToken to skip chain prefix

const createMarketEvent =
  'event CreateMarket(bytes20 indexed marketId, (address baseToken, address quoteToken, address curator, address lex) marketParams, (address aToken, address zToken) synthTokens, bytes initData, bytes lexData)';

const getMarketsDetailsAbi = dataProviderAbi.find(
  (x) => x.name === 'getMarketsDetails'
);

// PRICE_DIVISOR = 1e36 = 10^(2 * 18). Mirrors covenant-interface
// EVMBlockchainAdapter.ts:45 — synth and base prices are pre-scaled so that
// (balance * price) / 1e36 yields value in quote whole units regardless of
// token decimal mismatches.
async function tvl(api) {
  const toBlock = await api.getBlock();
  const logs = await api.getLogs({
    target: COVENANT,
    fromBlock: DEPLOY_BLOCK,
    toBlock,
    eventAbi: createMarketEvent,
    onlyArgs: true,
  });
  if (!logs.length) return;

  const marketIds = logs.map((l) => l.marketId);

  const { output: details } = await sdk.api.abi.call({
    target: DATA_PROVIDER,
    abi: getMarketsDetailsAbi,
    params: [COVENANT, marketIds],
    chain: CHAIN,
  });

  for (const d of details) {
    if (Number(d.marketState.statusFlag) === 0) continue;
    const baseSupply = BigInt(d.marketState.baseSupply.toString());
    const basePrice = BigInt(d.tokenPrices.baseTokenPrice.toString());
    if (basePrice === 0n || baseSupply === 0n) continue;

    // (baseSupply * basePrice) is scaled to 1e36 over whole quote units.
    // Divide by 1e18 once to get a 1e18-scaled quote value (quote-wei equivalent).
    const valueInQuoteWei = (baseSupply * basePrice) / 10n ** 18n;

    const quoteSym = d.quoteToken.symbol;
    if (quoteSym === 'USD') {
      // CoinGecko IDs have no associated decimals in DefiLlama's pricing
      // layer, so balance is treated as whole tokens. Pass whole USD.
      api.addCGToken(USD_CG_ID, valueInQuoteWei / 10n ** 18n);
    } else if (quoteSym === 'MON') {
      // Native MON has 18 decimals; valueInQuoteWei is already MON-wei.
      api.add(NATIVE_MON, valueInQuoteWei);
    }
    // Unknown quote symbols are skipped intentionally; would need a new
    // attribution mapping when Covenant adds non-USD/non-MON quote markets.
  }
}

module.exports = {
  methodology:
    'For each Covenant market, the value of base-token collateral locked in the Covenant contract is computed from on-chain state: baseSupply (from Covenant.getMarketState) multiplied by the curator-routed oracle price (from DataProvider.tokenPrices.baseTokenPrice, denominated in the market\'s quote unit). USD-quote markets are attributed as USDC for DefiLlama pricing; MON-quote markets are attributed as native MON. Markets are enumerated from CreateMarket logs on Covenant.sol. The TVL amount comes entirely from on-chain reads; CoinGecko is used only to convert the well-known quote anchors (USDC, MON) to USD.',
  monad: { tvl },
};
