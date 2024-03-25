const { getLogs } = require("../helper/cache/getLogs")
const { getUniqueAddresses } = require("../helper/utils")

const config = {
  ethereum: { fromBlock: 18782116, },
  optimism: { fromBlock: 113464669, },
  base: { fromBlock: 7869252, },
  arbitrum: { fromBlock: 159919891, },
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
  return api.erc4626Sum({ calls: vaults, isOG4626: true });
}

module.exports = {
  doublecounted: true,
  methodology:
    "Sums up deposits and borrows across Aloe's ERC4626 lending vaults to get TVL. Does not include collateral value.",
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})