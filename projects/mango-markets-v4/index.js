const { Program } = require("@project-serum/anchor");
const { getProvider, sumTokens2, decodeAccount } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");
const { get } = require("../helper/http");
const idl = require("./idl.json");
const sdk = require("@defillama/sdk");

// inlined from ./deposits
async function depositsTvl() {
  const provider = getProvider();
  const program = new Program(
    idl,
    "4MangoMjqJ2firMokCjjGgoK8d4MXcrgL7XJaL3w6fVg",
    provider,
  );
  const banks = await program.account.bank.all();
  return sumTokens2({ tokenAccounts: banks.map((i) => i.account.vault) });
}
async function borrowed(api) {
  const provider = getProvider();
  const program = new Program(
    idl,
    "4MangoMjqJ2firMokCjjGgoK8d4MXcrgL7XJaL3w6fVg",
    provider,
  );
  const banks = await program.account.bank.all();
  banks.forEach(({ account: i }) => {
    api.add(
      i.mint.toString(),
      i.indexedBorrows.val.mul(i.borrowIndex.val).toString() / 2 ** (48 * 2),
    );
  });
}

// inlined from ./orders
const endpoint = "https://api.mngo.cloud/data/v4/group-metadata";
const OPENBOOK_ID = new PublicKey(
  "srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX",
);
const MANGO_GROUP = "78b8f4cGCwmZ9ysPFMWLaLTkkaYnUjwMJYStWe5RTSSX";

async function ordersTvl(api) {
  const provider = getProvider();

  const [stats, openOrdersAccounts] = await Promise.all([
    get(endpoint),
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
  const group = stats.groups.find((g) => g.publicKey == MANGO_GROUP);

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

    api.add(baseToken.mint.toString(), baseAmount);
    api.add(quoteToken.mint.toString(), quoteAmount);
  });
}

module.exports = {
  timetravel: false,
  solana: { tvl: sdk.util.sumChainTvls([ depositsTvl ]), borrowed },
};
