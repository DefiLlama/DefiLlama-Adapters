const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const hypervisorAbi = require("./abis/hypervisor.json");
const { staking } = require("../helper/staking");
const getTotalAmounts =
  "function getTotalAmounts() view returns (uint256 total0, uint256 total1)";
const hypeRegistry = require("./abis/hypeRegistry.json");
const { getUniqueAddresses } = require("../helper/utils");

/* Pools for initial LM program in 2021 */
const LIQUIDITY_MINING_POOLS = [
  "0x64fcdd0de44f4bd04c039b0664fb95ef033d4efb", // GAMMA/ETH UNI-V2
  "0x96c105e9e9eab36eb8e2f851a5dabfbbd397c085", // USDC
  "0xebae3cb14ce6c2f26b40b747fd92ccaf03b98659", // USDT
  "0xf178d88d2f6f97ca32f92b465987068e1cce41c5", // DAI
];

/* List of hypervisor registries by chain
   One chain can have multiple registries for different underlying DEXes */
const HYPE_REGISTRY = {
  ethereum: [
    "0x31ccdb5bd6322483bebd0787e1dabd1bf1f14946", // Uniswap
  ],
  polygon: [
    "0x0Ac4C7b794f3D7e7bF1093A4f179bA792CF15055", // Uniswap
    "0xAeC731F69Fa39aD84c7749E913e3bC227427Adfd", // Quickswap
    "0xcAC19d43C9558753d7535978A370055614Ce832E", // Retro
    "0x97686103B3E7238Ca6c2C439146B30adBd84a593", // Sushiswap
    "0x7b9c2f68f16c3618bb45616fb98d83f94fd7062e", // Ascent
  ],
  polygon_zkevm: [
    "0xD08B593eb3460B7aa5Ce76fFB0A3c5c938fd89b8", // Quickswap
  ],
  optimism: [
    "0xF5BFA20F4A77933fEE0C7bB7F39E7642A070d599", // Uniswap
  ],
  arbitrum: [
    "0x66CD859053c458688044d816117D5Bdf42A56813", // Uniswap
    "0x37595FCaF29E4fBAc0f7C1863E3dF2Fe6e2247e9", // Zyberswap
    "0x0f867F14b39a5892A39841a03bA573426DE4b1d0", // Sushiswap
    "0x34Ffbd9Db6B9bD8b095A0d156de69a2AD2944666", // Ramses
    "0xa216C2b6554A0293f69A1555dd22f4b7e60Fe907", // Camelot
  ],
  bsc: [
    "0x0b4645179C1b668464Df01362fC6219a7ab3234c", // Uniswap
    "0xd4bcFC023736Db5617E5638748E127581d5929bd", // Thena
  ],
  moonbeam: [
    "0xB7dfC304D9cd88D98A262cE5B6a39Bb9d6611063", // Beamswap
    "0x6002D7714e8038f2058e8162b0b86c0b19c31908", // Stellaswap
  ],
  celo: [
    "0x0F548d7AD1A0CB30D1872b8C18894484d76e1569", // Uniswap
  ],
  avax: [
    "0x3FE6F25DA67DC6AD2a5117a691f9951eA14d6f15", // Glacier
  ],
  fantom: [
    "0xf874d4957861e193aec9937223062679c14f9aca", // Spiritswap
  ],
  mantle: [
    "0x683292172E2175bd08e3927a5e72FC301b161300", // FusionX
  ],
};

/* List of bad addresses added to registries that need to be excluded manually */
const blacklist = {
  ethereum: [ADDRESSES.ethereum.WBTC],
  polygon: ["0xa9782a2c9c3fb83937f14cdfac9a6d23946c9255"],
};

/*Tokens staked in Visors*/
async function tvlLiquidityMining(_timestamp, _block, _, { api }) {
  const balances = {};

  //get the staking pool contracts, and the respective token addresses
  const bals = await api.multiCall({
    abi: hypervisorAbi.getHyperVisorData,
    calls: LIQUIDITY_MINING_POOLS,
  });
  bals.forEach(({ stakingToken, totalStake }, i) =>
    sdk.util.sumSingleBalance(balances, stakingToken, totalStake, api.chain)
  );
  return balances;
}

/*Tokens deposited in Uniswap V3-like LP positions managed by Gamma Strategies*/
async function tvlUniV3(api) {
  const targets = HYPE_REGISTRY[api.chain];

  // Bulk fetch lists for all registries the chain and flatten into one array
  let hypervisors = await Promise.all(
    targets.map((target) =>
      api.fetchList({
        lengthAbi: hypeRegistry.counter,
        itemAbi: hypeRegistry.hypeByIndex,
        target,
      })
    )
  ).then((data) => data.flat());

  // Filter out invalid hypervisors, valid hypervisors have hypeIndex > 0
  hypervisors = hypervisors
    .filter((hypervisor) => hypervisor[1] > 0)
    .map((i) => i[0]);

  return getHypervisorBalances({ hypervisors, api });
}

async function tvlWrapper(_, _b, _cb, { api }) {
  return tvlUniV3(api);
}

async function getHypervisorBalances({ hypervisors, api, balances = {} }) {
  hypervisors = getUniqueAddresses(hypervisors);
  if (blacklist[api.chain]) {
    const blacklistSet = new Set(
      blacklist[api.chain].map((i) => i.toLowerCase())
    );
    hypervisors = hypervisors.filter((i) => !blacklistSet.has(i.toLowerCase()));
  }
  const supplies = await api.multiCall({
    abi: "erc20:totalSupply",
    calls: hypervisors,
    permitFailure: true,
  });
  hypervisors = hypervisors.filter((_, i) => +supplies[i] > 0);

  const [token0s, token1s, bals] = await Promise.all([
    api.multiCall({ calls: hypervisors, abi: "address:token0" }),
    api.multiCall({ calls: hypervisors, abi: "address:token1" }),
    api.multiCall({ calls: hypervisors, abi: getTotalAmounts }),
  ]);
  bals.forEach(({ total0, total1 }, i) => {
    sdk.util.sumSingleBalance(balances, token0s[i], total0, api.chain);
    sdk.util.sumSingleBalance(balances, token1s[i], total1, api.chain);
  });
  return balances;
}

module.exports = {
  doublecounted: true,
  start: 1616679762, // (Mar-25-2021 01:42:42 PM +UTC)
  ethereum: {
    tvl: sdk.util.sumChainTvls([tvlLiquidityMining, tvlWrapper]),
    staking: staking(
      "0x26805021988f1a45dc708b5fb75fc75f21747d8c",
      "0x6bea7cfef803d1e3d5f7c0103f7ded065644e197",
      "ethereum"
    ),
  },
  polygon: {
    tvl: tvlWrapper,
  },
  polygon_zkevm: {
    tvl: tvlWrapper,
  },
  optimism: {
    tvl: tvlWrapper,
  },
  arbitrum: {
    tvl: tvlWrapper,
  },
  bsc: {
    tvl: tvlWrapper,
  },
  moonbeam: {
    tvl: tvlWrapper,
  },
  celo: {
    tvl: tvlWrapper,
  },
  avax: {
    tvl: tvlWrapper,
  },
  fantom: {
    tvl: tvlWrapper,
  },
  mantle: {
    tvl: tvlWrapper,
  },
};
