const { getCuratorTvl } = require("../helper/curators");
const { getLogs2 } = require('../helper/cache/getLogs');
const { sumTokens2 } = require('../helper/unwrapLPs');

const WRAPPER_FACTORIES = {
  unichain: { address: '0x7777655b9474D2f3F27EE44F3FD1343e33ce2777', fromBlock: 42132957 },
  ethereum: { address: '0x77774aBb84EEAbaE05CE00D8a1b83dfc6E93f777', fromBlock: 24589014 },
};

const eulerVaultOwners = ['0x12e74f3C61F6b4d17a9c3Fdb3F42e8f18a8bB394'];

async function getUniV4CollateralTvl(api) {
  const config = WRAPPER_FACTORIES[api.chain];
  const logs = await getLogs2({
    api, 
    target: config.address, 
    fromBlock: config.fromBlock,
    eventAbi: 'event UniswapV4WrapperCreated(address indexed uniswapV4Wrapper, address indexed fixedRateOracle, bytes32 indexed poolId, address oracle, address unitOfAccount, tuple(address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) poolKey)',
  });
  for (const { uniswapV4Wrapper: owner } of logs)
    await sumTokens2({ api, owner, resolveUniV4: true });
}

async function tvl(api) {
  await getCuratorTvl(api, { eulerVaultOwners });
  await getUniV4CollateralTvl(api);
}

module.exports = {
  methodology: 'Count all assets deposited in all vaults curated by VII Finance, plus Uniswap V4 Liquidity Positions used as collateral.',
  doublecounted: true,
  unichain: { tvl },
  ethereum: { tvl },
};