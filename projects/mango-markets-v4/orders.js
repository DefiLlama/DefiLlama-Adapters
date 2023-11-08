const { getProvider, decodeAccount } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");
const { transformBalances } = require("../helper/portedTokens");
const sdk = require("@defillama/sdk");
const axios = require("axios");

const endpoint = "https://api.mngo.cloud/data/v4/group-metadata";
const OPENBOOK_ID = new PublicKey(
  "srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX",
);
const MANGO_GROUP = "78b8f4cGCwmZ9ysPFMWLaLTkkaYnUjwMJYStWe5RTSSX";

async function ordersTvl() {
  const provider = getProvider();

  const [stats, openOrdersAccounts] = await Promise.all([
    axios.get(endpoint),
    provider.connection.getProgramAccounts(OPENBOOK_ID, {
      filters: [
        {
          dataSize: 3228,
        },
        {
          memcmp: {
            offset: 45,
            bytes: MANGO_GROUP,
          },
        },
      ],
    }),
  ]);
  const group = stats.data.groups.find((g) => g.publicKey == MANGO_GROUP);

  const markets = await provider.connection.getMultipleAccountsInfo(
    group.serum3Markets.map((m) => new PublicKey(m.serumMarketExternal)),
  );
  const decodedMarkets = markets.map((acc) => decodeAccount("openbook", acc));

  const balances = {};

  openOrdersAccounts.forEach((account) => {
    const oo = decodeAccount("openbookOpenOrders", account.account);
    const market = group.serum3Markets.find(
      (m) => m.serumMarketExternal === oo.market.toBase58(),
    );
    const decodedMarket = decodedMarkets.find(
      (m) => m.ownAddress.toBase58() === market.serumMarketExternal,
    );

    const baseToken = group.tokens.find(
      (t) => t.tokenIndex === market.baseTokenIndex,
    );
    const baseLots = decodedMarket.baseLotSize.toNumber();
    const baseAmount =
      (oo.baseTokenTotal.toNumber() * baseLots) / 10 ** baseToken.decimals;

    const quoteToken = group.tokens.find(
      (t) => t.tokenIndex === market.quoteTokenIndex,
    );
    const quoteLots = decodedMarket.quoteLotSize.toNumber();
    const quoteAmount =
      (oo.quoteTokenTotal.toNumber() * quoteLots) / 10 ** quoteToken.decimals;

    sdk.util.sumSingleBalance(balances, baseToken.mint.toString(), baseAmount);
    sdk.util.sumSingleBalance(
      balances,
      quoteToken.mint.toString(),
      quoteAmount,
    );
  });

  return transformBalances("solana", balances);
}

module.exports = {
  ordersTvl,
};
