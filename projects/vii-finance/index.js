const { getCuratorTvl } = require("../helper/curators");
const { getLogs2 } = require('../helper/cache/getLogs');
const { sumTokens2 } = require('../helper/unwrapLPs');
const { sumERC4626VaultsExport2 } = require('../helper/erc4626');

const WRAPPER_FACTORIES = {
  unichain: { address: '0x7777655b9474D2f3F27EE44F3FD1343e33ce2777', fromBlock: 42132957 },
  ethereum: { address: '0x77774aBb84EEAbaE05CE00D8a1b83dfc6E93f777', fromBlock: 24589014 },
  monad: { address: '0x7777dc1a68addc8b5ab991c7f29dc2904367e777', fromBlock: 66930998 },
};

const eulerVaultOwners = ['0x12e74f3C61F6b4d17a9c3Fdb3F42e8f18a8bB394'];

const monadUniV4Wrappers = [
  "0x43c8edfe8bdb8a9dc98a9c5dccfeb057bed25950",
  "0x6a593b01138c8d522b6a2fe026f1773d3216ae8f",
  "0x7ac4680086d84f96d6f9031367ccac197b9b4397",
  "0xa878dac5c606b27cac9ddfb33c7952161b4e77f5",
  "0xdb1b130512aedbbd7ff5da85b640250dd8230a41",
  "0xe69fd165953bd28fee5025981155184dacdd23c3",
];

const monadVaults = [
  "0x5e43e6cb7DAf0cFC810d0F80A1e05b3D49FA9192",
  "0x852E9D248b1a294566737633C2f829Ea8257553b",
  "0x3d4bB6cd6a2207D3e1747cE757364eEAaD684C79",
  "0x7a5Ab5Bd7F2DB9960813763e86eB789192F56768",
  "0xc5251BC7f19d9579CafE6aD619EC568E947DC0C5",
  "0x56e07C30ca75A6aA9b8437975ff3130E3dC7A699",
];

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
  monad: {
    tvl: async (api) => {
      await sumERC4626VaultsExport2({ vaults: monadVaults })(api);
      for (const owner of monadUniV4Wrappers)
        await sumTokens2({ api, owner, resolveUniV4: true });
    }
  },
};