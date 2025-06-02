const { uniV3Export } = require("../helper/uniswapV3");
const { cachedGraphQuery } = require("../helper/cache");
const sdk = require("@defillama/sdk");
const iceCreamVanABI = require("./iceCreamVanABI.json");
const zombieVanABI = require("./zombieVanABI.json");
const ADDRESSES = require("../helper/coreAssets.json");

module.exports = uniV3Export({
  mantle: {
    factory: "0xC848bc597903B4200b9427a3d7F61e3FF0553913",
    fromBlock: 9796947,
    isAlgebra: true,
  },
  telos: {
    factory: "0xA09BAbf9A48003ae9b9333966a8Bda94d820D0d9",
    fromBlock: 301362984,
    isAlgebra: true,
  },
  taiko: {
    factory: "0xBa90FC740a95A6997306255853959Bb284cb748a",
    fromBlock: 338445,
    isAlgebra: true,
  },
});

const contracts = {
  telos: {
    stakingContract_iceCreamVan: "0xA234Bb3BEb60e654601BEa72Ff3fB130f9ed2aa7",
    stakingContract_zombieVan: "0x67275189e0deb3ce9eb918928c0011a0a582bd0e",
    stakingContract_iceCreamZombies: "0x581b6d860aa138c46dcaf6d5c709cd070cd77eb8",
    slush: "0xac45ede2098bc989dfe0798b4630872006e24c3f",
  },
  mantle: {
    stakingContract_iceCreamVan: "0xe0ac81c7692b9119658e01edc1d743bf4c2ec21a",
    stakingContract_zombieVan: "0x049a58a2aa1b15628aa0cda0433d716f6f63cbba",
    stakingContract_iceCreamZombies: "0x21b276de139ce8c75a7b4f750328dbf356195b49",
    slush: "0x8309bc8bb43fb54db02da7d8bf87192355532829",
  },
  taiko: {
    stakingContract_iceCreamVan: "0x0cdde1dead51b156bd62113664d60b354b4df4ab",
    slush: "0x36bfe1f1b36cfdb4fe75cc592ff5dc6200ad3e0f",
  },
};

const config = {
  mantle: {
    endpoint:
      "https://subgraph-api.mantle.xyz/api/public/f077c8d4-0d6c-42d4-9bbd-050948dc5c86/subgraphs/swapsicle/analytics/prod/gn",
  },
  telos: {
    endpoint:
      "https://api.telos.0xgraph.xyz/api/public/f59149ee-c99a-41d0-afe4-1c86170a98b0/subgraphs/swapsicle/analytics/prod/gn",
  },
  taiko: {
    endpoint:
      "https://api.goldsky.com/api/public/project_clr6mlufzbtuy01vd012wgt5k/subgraphs/swapsicle-analytics-taiko/prod/gn",
  },
};

const slushPriceQuery = `{
    token(id: "TOKENID") {
      derivedMatic
    }
}`;

const nativeTokenAddresses = {
  telos: `telos:${ADDRESSES.telos.WTLOS}`,
  mantle: `mantle:${ADDRESSES.mantle.WMNT}`,
  taiko: `taiko:${ADDRESSES.taiko.WETH}`,
};

async function slushToNativeConvert(slushAmount, chain) {
  const slushNativePrice = await cachedGraphQuery(
    "swapsicle-slush-eth-price/" + chain,
    config[chain].endpoint,
    slushPriceQuery.replace(
      "TOKENID",
      contracts[chain].slush
    )
  );
  return slushAmount / 10 ** 18 * slushNativePrice.token.derivedMatic;
}

/** Returns an object as follows { `chainName:nativeTokenAddress`: slushBalanceInNativeToken } */
async function getStakeBalance(slushBalance, chain) {
  const nativeBalance = await slushToNativeConvert(slushBalance, chain);
  return {
    [nativeTokenAddresses[chain]]: nativeBalance * 10 ** 18
  };
}

async function iceCreamVanStake(api) {
  const response = await api.call({
    target: contracts[api.chain].stakingContract_iceCreamVan,
    abi: iceCreamVanABI.totalShares,
  })
  return getStakeBalance(response, api.chain);
}

async function ZombieVanStake(api) {
  const response = await api.call({
    target: contracts[api.chain].stakingContract_zombieVan,
    abi: zombieVanABI.totalStaked,
  })
  return getStakeBalance(response, api.chain);
}

async function ICZStake(api) {
  const response = await api.call({
    abi: 'erc20:balanceOf',
    target: contracts[api.chain].slush,
    params: contracts[api.chain].stakingContract_iceCreamZombies,
  })
  return getStakeBalance(response, api.chain);
}

Object.keys(config).forEach((chain) => {
  module.exports[chain].staking = sdk.util.sumChainTvls([
    (api) => iceCreamVanStake(api),
    (api) => (chain !== 'taiko' ? ZombieVanStake(api) : 0),
    (api) => (chain !== 'taiko' ? ICZStake(api) : 0),
  ]);
});