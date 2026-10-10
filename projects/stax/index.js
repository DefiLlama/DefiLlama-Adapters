// Stax (stax.finance) -- tokenized-stock index baskets on Robinhood Chain.
// TVL = the stock tokens and USDG held as basket collateral by the two Stax vaults
// (v19 and V2) and by the V2 community-basket clones created through the Stax factory.
// Baskets are discovered from the vaults' BasketCreated events and the factory's list,
// and each basket's token list is read on-chain, so new baskets and tickers are picked
// up without an adapter change. A failed read of an existing basket throws (no silent
// under-reporting).
// Not counted: STAX staked in StaxStaking (governance token), USDG parked in the
// rewards distributor, protocol fee buckets.
const { sumTokens2 } = require("../helper/unwrapLPs");
const { getLogs2 } = require("../helper/cache/getLogs");

const VAULTS = [
  { address: "0x13045D3Dab253fDB15181C16f135D612fa8546E6", fromBlock: 46338037 }, // StaxVaultV2 "v19" -- commodities, retailfavorites, mag7, mag7cap
  { address: "0xAda84161033C0Cc54EF21CEeF913A8fEC4239b33", fromBlock: 68883165 }, // StaxVaultV2 (V2) -- newer baskets
];
const USER_BASKET_FACTORY = "0x1de6a6bD0C62097A7559A29a76e41985558f9918"; // StaxUserBasketFactoryV2
const USDG = "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168";

const abi = {
  basketCreated: "event BasketCreated(uint256 indexed basketId, address token, string name)",
  getBasketComposition: "function getBasketComposition(uint256 basketId) view returns (address[] tickers, uint256[] weights)",
  getComposition: "function getComposition() view returns (address[] tickers, uint256[] weights)",
  basketCount: "uint256:basketCount",
  baskets: "function baskets(uint256) view returns (address)",
};

async function tvl(api) {
  const owners = VAULTS.map((v) => v.address);
  const tokens = new Set([USDG]);
  const addTickers = (comps) => comps.forEach((c) => c.tickers.forEach((t) => tokens.add(t)));

  // Vault baskets: ids from BasketCreated events (exact, no cap); compositions must all resolve.
  for (const vault of VAULTS) {
    const created = await getLogs2({ api, target: vault.address, eventAbi: abi.basketCreated, fromBlock: vault.fromBlock });
    const ids = created.map((e) => e.basketId);
    if (!ids.length) continue;
    addTickers(await api.multiCall({ abi: abi.getBasketComposition, calls: ids.map((id) => ({ target: vault.address, params: [id] })) }));
  }

  // Community baskets: clones hold their own collateral.
  const clones = await api.fetchList({ lengthAbi: abi.basketCount, itemAbi: abi.baskets, target: USER_BASKET_FACTORY });
  if (clones.length) {
    addTickers(await api.multiCall({ abi: abi.getComposition, calls: clones }));
    owners.push(...clones);
  }

  return sumTokens2({ api, owners, tokens: [...tokens] });
}

module.exports = {
  methodology:
    "TVL is the tokenized-stock tokens and USDG held as basket collateral by the Stax vaults and community-basket contracts on Robinhood Chain, read from each basket's on-chain composition and priced individually. Staked STAX and undistributed rewards are excluded.",
  robinhood: { tvl },
};
