const { getLogs } = require("../helper/cache/getLogs");

const factories = {
  ethereum: {
    address: "0x000000009efdB26b970bCc0085E126C9dfc16ee8",
    fromBlock: 18782116,
  },
  optimism: {
    address: "0x000000009efdB26b970bCc0085E126C9dfc16ee8",
    fromBlock: 113464669,
  },
  base: {
    address: "0x000000009efdB26b970bCc0085E126C9dfc16ee8",
    fromBlock: 7869252,
  },
  arbitrum: {
    address: "0x000000009efdB26b970bCc0085E126C9dfc16ee8",
    fromBlock: 159919891,
  },
};

async function getVaults(api) {
  const { address: factory, fromBlock } = factories[api.chain];
  const createMarketEvents = await getLogs({
    api,
    fromBlock,
    target: factory,
    topic: "CreateMarket(address,address,address)",
    eventAbi:
      "event CreateMarket(address indexed pool, address lender0, address lender1)",
    onlyArgs: true,
  });
  return createMarketEvents.flatMap((eventArgs) => eventArgs.slice(1));
}

async function getTvl(api) {
  const vaults = await getVaults(api);
  return api.erc4626Sum({ calls: vaults, isOG4626: true });
}

async function getBorrows(api) {
  const vaults = await getVaults(api);
  const tokens = await api.multiCall({ calls: vaults, abi: "address:asset" });
  const stats = await api.multiCall({
    calls: vaults,
    abi: "function stats() view returns (uint72, uint256, uint256, uint256)",
  });
  api.addTokens(
    tokens,
    stats.map((x) => x[2])
  );
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  doublecounted: false,
  methodology:
    "Sums up deposits and borrows across Aloe's ERC4626 lending vaults to get TVL and Borrowed amounts, respectively. Does not include collateral value.",
  ...Object.fromEntries(
    Object.keys(factories).map((chain) => [
      chain,
      { tvl: getTvl, borrowed: getBorrows },
    ])
  ),
};
