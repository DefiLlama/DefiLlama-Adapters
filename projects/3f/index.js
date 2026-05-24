const { getLogs2 } = require("../helper/cache/getLogs");


// Collateral is held in WrappedAsset proxies (strict 1:1 wrappers) deployed by the
// factory below. We discover every wrapper from its `Deployed` events, resolve each
// one's `underlying()`, and sum the underlying collateral held by each wrapper — so
// TVL is priced from the real underlying token and new wrappers are picked up
// automatically.
const WRAPPER_ASSET_FACTORY = "0x54f862fa0612a8709f6dec4a7b39af015cd4e82e";
const DEPLOY_EVENT =
  "event Deployed(address indexed proxy, address indexed implementation, address indexed admin)";

async function tvl(api) {
  const deployEvents = await getLogs2({
    api,
    target: WRAPPER_ASSET_FACTORY,
    eventAbi: DEPLOY_EVENT,
    fromBlock: 24841246,
  });

  const wrappedTokens = deployEvents.map((d) => d.proxy);

  // Only WrappedAsset proxies expose `underlying()`; any other proxy from the
  // factory returns null and is filtered out (prevents double-counting).
  const underlyings = await api.multiCall({
    abi: "address:underlying",
    calls: wrappedTokens.map((t) => ({ target: t })),
    permitFailure: true,
  });

  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
  const validPairs = wrappedTokens
    .map((vault, i) => ({ vault, token: underlyings[i] }))
    .filter(({ token }) => token && token.toLowerCase() !== ZERO_ADDRESS);

  return api.sumTokens({
    tokensAndOwners: validPairs.map((i) => [i.token, i.vault]),
  });
}

module.exports = {
  methodology:
    "TVL is the underlying collateral locked inside 3F's WrappedAsset wrappers. Wrappers are discovered on-chain from the WrappedAsset factory's Deployed events; each is a strict 1:1 wrapper, so TVL is the underlying token balance held by each wrapper, valued at the underlying's market price.",
  start: "2026-04-08",
  ethereum: { tvl },
};
