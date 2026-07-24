// Naro — CeDeFi yield-bearing BTC vault (BTCvp on Pharos)
//
// Naro is a centralized, yield-bearing BTC product — the same model as BitFi bfBTC.
// Deposited BTC is custodied and deployed to centralized exchange venues where curators run
// the trading strategy. BTCvp is the on-chain receipt token: a 1:1 claim on the deposited BTC.
//
// METHODOLOGY:
//   TVL = BTCvp.totalSupply on Pharos, priced 1:1 as BTC (BTCvp has 8 decimals, like BTC).
//   The backing BTC lives at centralized venues and is actively traded, so it is NOT summed
//   on-chain: those exchange/deposit wallets are pass-through (deposit-and-sweep) and net to
//   ~0, so counting them would be both wrong and volatile. Counting the receipt is the
//   correct, stable measure of outstanding user claims (same as BitFi's bfBTC adapter).
//
// PRICING: BTCvp is 1:1 BTC-backed, so its supply is priced against DefiLlama's canonical
//   bitcoin price via addCGToken('bitcoin', ...). No BTCvp listing and no DEX pool needed.
//
// Separate product from BTCvc (projects/vishwa), Vishwa's zk-verifiable reserve product on
// separate custody. No overlap, no cross-count.

const BTCVP = "0x79d154287ddc77e5c10127e68c2df1a942a330bb"; // Pharos Pacific mainnet (chainId 1672), 8 decimals

module.exports = {
  methodology:
    "TVL is the total supply of BTCvp on Pharos, priced 1:1 as BTC. BTCvp is the receipt " +
    "token for a centralized, yield-bearing BTC vault; the backing BTC is held at " +
    "centralized venues and traded, so it is not counted on-chain. Counting the receipt " +
    "measures outstanding user claims and avoids double-counting the backing.",
  pharos: {
    tvl: async (api) => {
      const supply = await api.call({ abi: "erc20:totalSupply", target: BTCVP });
      // 1:1 BTC-backed, 8dp (same as BTC) -> price the supply as BTC.
      api.addCGToken("bitcoin", Number(supply) / 1e8);
    },
  },
};

/* Backing (centralized, NOT counted — documented for transparency).
   Deposited BTC is custodied at exchange/custodian venues and deployed to the trading
   strategy. These are shared/rotating custodian addresses (omnibus), so their balances do
   NOT map to Naro TVL and are not counted. TVL is the BTCvp receipt supply above.
   Exchange / custody deposit addresses (current rotation):
     Kraken:          3HgEcyJVdFCgCqKH427TbHo2jn9zGj5jTv
     OKX (Taproot):   bc1p8xf6y2mk9ldej8ny2rtmktlveja7x3ych8678vd6h4jam067r9wq0cupd3
     Ceffu Custodian: bc1qkqz6u2quzu94xd9wm4wmugpuxkfmm5xtccmzjk
     Binance:         12sVTsCh8VasSAQ7f8efgR5cyLY3gp99bw
*/
