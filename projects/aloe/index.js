const { getLogs } = require("../helper/cache/getLogs")
const { getUniqueAddresses } = require("../helper/utils")

const config = {
  ethereum: { fromBlock: 18782116, },
  optimism: { fromBlock: 113464669, },
  base: { fromBlock: 7869252, },
  arbitrum: { fromBlock: 159919891, },
  linea: { factory: '0x00000000333288eBA83426245D144B966Fd7e82E', fromBlock: 3982456 },
};

async function getVaults(api) {
  const { factory = '0x000000009efdB26b970bCc0085E126C9dfc16ee8', fromBlock } = config[api.chain];
  const createMarketEvents = await getLogs({
    api,
    fromBlock,
    target: factory,
    eventAbi: "event CreateMarket(address indexed pool, address lender0, address lender1)",
    onlyArgs: true,
  });
  const res = createMarketEvents.flatMap(i => [i.lender0, i.lender1])
  return getUniqueAddresses(res)
}

async function tvl(api) {
  const vaults = await getVaults(api);
  return api.erc4626Sum({ calls: vaults, tokenAbi: 'address:asset', balanceAbi: 'uint256:lastBalance' });
}

async function borrowed(api) {
  const vaults = await getVaults(api);
  const tokens = await api.multiCall({ calls: vaults, abi: "address:asset" });
  const stats = await api.multiCall({
    calls: vaults,
    abi: "function stats() view returns (uint72 borrowIndex, uint256 totalAssets, uint256 totalBorrows, uint256 totalSupply)",
  });
  api.addTokens(tokens, stats.map(x => x.totalBorrows));
}

module.exports = {
  doublecounted: false,
  methodology:
    "Sums up deposits and borrows across Aloe's ERC4626 lending vaults to get TVL and Borrowed amounts, respectively. Does not include collateral value.",
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl, borrowed }
})