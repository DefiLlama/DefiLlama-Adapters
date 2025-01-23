const { sumTokens2 } = require("../helper/unwrapLPs");
const { getLogs } = require("../helper/cache/getLogs");

const VAULT_STATUS_ABI = "function getVaultStatus() returns (uint256 amount0, uint256 amount1, uint256 fees0, uint256 fees1, uint128 liquidity)";
const DEFAULT_FACTORY = '0x25f47fEF4D6471a8b9Cb93197E1bdAa4a256EE23'
const CONFIG = {
  ethereum: { uniswapRegistry: { startBlock: 16864761, }, },
  polygon: { uniswapRegistry: { startBlock: 40543157, }, },
  bsc: { uniswapRegistry: { startBlock: 26612076, }, },
  optimism: { uniswapRegistry: { startBlock: 82239696, }, },
  arbitrum: { uniswapRegistry: { startBlock: 71578282, }, },
};

async function tvl(api) {
  const chainConfig = CONFIG[api.chain]["uniswapRegistry"];

  const vaultLogs = await getLogs({
    target: chainConfig.target ?? DEFAULT_FACTORY,
    topic: "VaultCreated(address,uint8,address)",
    fromBlock: chainConfig.startBlock,
    api,
    onlyArgs: true,
    eventAbi: 'event VaultCreated(address indexed ,uint8 indexed ,address indexed vault)'
  });

  const vaults = vaultLogs.map(i => i.vault)
  const [token0s, token1s, data] = await Promise.all([
    api.multiCall({ abi: 'address:token0', calls: vaults, }),
    api.multiCall({ abi: 'address:token1', calls: vaults, }),
    api.multiCall({ abi: VAULT_STATUS_ABI, calls: vaults, }),
  ])
  const ownerTokens = vaults.map((v, i) => [[token0s[i], token1s[i]], v])
  data.forEach((v, i) => {
    api.add(token0s[i], v.amount0)
    api.add(token0s[i], v.fees0)
    api.add(token1s[i], v.amount1)
    api.add(token1s[i], v.fees1)
  })

  return sumTokens2({ api, ownerTokens });
}

module.exports = {
  doublecounted: true,
};

Object.keys(CONFIG).forEach(chain => {
  module.exports[chain] = { tvl }
})
