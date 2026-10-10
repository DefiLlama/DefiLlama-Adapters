// Stax (stax.finance) -- tokenized-stock index baskets on Robinhood Chain.
// TVL = the stock tokens and USDG held as basket collateral by the two Stax vaults
// (v19 and V2) and, when INCLUDE_COMMUNITY_BASKETS is on, by the V2 community-basket
// clones created through the Stax factory. Each basket's token list is read on-chain,
// so new baskets and tickers are picked up without an adapter change.
// Not counted: STAX staked in StaxStaking (governance token), USDG parked in the
// rewards distributor, protocol fee buckets.
const { sumTokens2 } = require("../helper/unwrapLPs");

const VAULTS = [
  "0x13045D3Dab253fDB15181C16f135D612fa8546E6", // StaxVaultV2 "v19" -- commodities, retailfavorites, mag7, mag7cap
  "0xAda84161033C0Cc54EF21CEeF913A8fEC4239b33", // StaxVaultV2 (V2) -- newer baskets
];
const USER_BASKET_FACTORY = "0x1de6a6bD0C62097A7559A29a76e41985558f9918"; // StaxUserBasketFactoryV2
const USDG = "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168";
const MAX_BASKETS_PER_VAULT = 32; // basket ids are sequential from 1; probe up to this many
const INCLUDE_COMMUNITY_BASKETS = true;

const abi = {
  getBasketComposition: "function getBasketComposition(uint256 basketId) view returns (address[] tickers, uint256[] weights)",
  getComposition: "function getComposition() view returns (address[] tickers, uint256[] weights)",
  basketCount: "uint256:basketCount",
  baskets: "function baskets(uint256) view returns (address)",
};

async function tvl(api) {
  const owners = [...VAULTS];
  const tokens = new Set([USDG.toLowerCase()]);

  // Vault baskets: ids 1..N, unknown N -> probe and keep the ones that exist.
  const ids = Array.from({ length: MAX_BASKETS_PER_VAULT }, (_, i) => i + 1);
  for (const vault of VAULTS) {
    const comps = await api.multiCall({
      abi: abi.getBasketComposition,
      calls: ids.map((id) => ({ target: vault, params: [id] })),
      permitFailure: true,
    });
    for (const c of comps) if (c) for (const t of c.tickers) tokens.add(t.toLowerCase());
  }

  // Community baskets: clones hold their own collateral.
  if (INCLUDE_COMMUNITY_BASKETS) {
    const clones = await api.fetchList({ lengthAbi: abi.basketCount, itemAbi: abi.baskets, target: USER_BASKET_FACTORY });
    if (clones.length) {
      const comps = await api.multiCall({ abi: abi.getComposition, calls: clones, permitFailure: true });
      for (const c of comps) if (c) for (const t of c.tickers) tokens.add(t.toLowerCase());
      owners.push(...clones);
    }
  }

  return sumTokens2({ api, owners, tokens: [...tokens] });
}

module.exports = {
  methodology:
    "TVL is the tokenized-stock tokens and USDG held as basket collateral by the Stax vaults and community-basket contracts on Robinhood Chain, read from each basket's on-chain composition and priced individually. Staked STAX and undistributed rewards are excluded.",
  robinhood: { tvl },
};
