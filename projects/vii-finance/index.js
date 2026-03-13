const { getCuratorExport } = require("../helper/curators");
const { getLogs } = require('../helper/cache/getLogs');
const { cachedGraphQuery } = require('../helper/cache');
const { sumTokens2 } = require('../helper/unwrapLPs');

const UNISWAP_V4_WRAPPER_FACTORY = {
  unichain: '0x7777655b9474D2f3F27EE44F3FD1343e33ce2777',
  ethereum: '0x77774aBb84EEAbaE05CE00D8a1b83dfc6E93f777',
};

const POSITION_MANAGER = {
  unichain: '0x4529a01c7a0410167c5740c487a8de60232617bf',
  ethereum: '0xbd216513d74c8cf14cf4747e6aaa6420ff64ee9e',
};

const STAT_VIEW = {
  unichain: '0x86e8631a016f9068c3f085faf484ee3f5fdee8f2',
  ethereum: '0x7ffe42c4a5deea5b0fec41c94c136cf115597227',
};

const UNISWAP_V4_WRAPPER_FACTORY_START_BLOCKS = {
  unichain: 42132957 ,       
  ethereum: 24589014,   
};

const UNI_V4_SUBGRAPH_URLS = {
  ethereum: 'https://gateway.thegraph.com/api/[api-key]/subgraphs/id/DiYPVdygkfjDWhbxGSqAQxwBKmfKnkWQojqeM2rkLb3G',
  unichain:  'https://gateway.thegraph.com/api/[api-key]/subgraphs/id/aa3YpPCxatg4LaBbLFuv2iBC8Jvs9u3hwt5GTpS4Kit',
};

const WRAPPER_CREATED_ABI = 'event UniswapV4WrapperCreated(address indexed uniswapV4Wrapper, address indexed fixedRateOracle, bytes32 indexed poolId, address oracle, address unitOfAccount, tuple(address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) poolKey)';


function buildPositionsQuery(owner) {
  return `
    {
      positions(where: { owner: "${owner.toLowerCase()}" }) {
        tokenId
      }
    }
  `;
}


async function getUniswapV4CollateralTvl(api, chain) {
  const subgraphUrl = UNI_V4_SUBGRAPH_URLS[chain];

  // 1. Get all UniswapV4Wrapper addresses from WrapperCreated factory events
  // UniswapV4Wrapper is the collateral only vault that plugs in with Euler Vault Kit so that Uniswap V4 LP Positions can be accepted as collateral
  const logs = await getLogs({
    api,
    target: UNISWAP_V4_WRAPPER_FACTORY[chain],
    fromBlock: UNISWAP_V4_WRAPPER_FACTORY_START_BLOCKS[chain],
    eventAbi: WRAPPER_CREATED_ABI,
    onlyArgs: true,
  });

  const wrapperAddresses = logs.map(log => log.uniswapV4Wrapper.toLowerCase());
  if (!wrapperAddresses.length) return;

  // 2. For each wrapper, query the subgraph for tokenIds it owns
  // We have to do this because unlike Uniswap V3' NonFungiblePositionManager there is no onchain way to get the tokenIds owned by an address
  // This logic can be moved into sumTokens2.unwrapUniswapV4NFTs and removed from here
  const positionIds = [];

  await Promise.all(wrapperAddresses.map(async (wrapper) => {
    const cacheKey = `vii-finance/${chain}/positions/${wrapper}`;
    const data = await cachedGraphQuery(cacheKey, subgraphUrl, buildPositionsQuery(wrapper));
    if (data?.positions?.length) {
      data.positions.forEach(p => positionIds.push(p.tokenId));
    }
  }));

  if (!positionIds.length) return;

  // 3. Delegate all liquidity math via sumTokens2 with resolveUniV4
  //    uniV4ExtraConfig.positionIds tells the helper which tokenIds to process
  await sumTokens2({
    api,
    resolveUniV4: true,
    uniV4ExtraConfig: {
      positionIds,
      nftAddress: POSITION_MANAGER[chain],
      stateViewer: STAT_VIEW[chain],
    },
  });
}
 
// On top of the Uniswap V4 Wrapper as collateral, the vaults still works the same
const configs = {
  methodology: 'Count all assets deposited in all vaults curated by VII Finance, plus Uniswap V4 Liquidity Positions used as collateral.',
  blockchains: {
    unichain: {
      eulerVaultOwners: [
        '0x12e74f3C61F6b4d17a9c3Fdb3F42e8f18a8bB394',
      ],
    },
    ethereum: {
      eulerVaultOwners: [
        '0x12e74f3C61F6b4d17a9c3Fdb3F42e8f18a8bB394',
      ],
    },
  },
};
 
// wrap getCuratorExport and inject the extra collateral TVL
const curatorModule = getCuratorExport(configs);
 
function wrapTvl(chain, originalTvl) {
  return async (api) => {
    await Promise.all([
      originalTvl(api),
      getUniswapV4CollateralTvl(api, chain),
    ]);
  };
}
 
Object.keys(curatorModule).forEach(chain => {
    curatorModule[chain].tvl = wrapTvl(chain, curatorModule[chain].tvl);
});
 
module.exports = curatorModule;