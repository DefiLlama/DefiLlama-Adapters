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
});

const contracts = {
  telos: {
    stakingContract_iceCreamVan: "0xA234Bb3BEb60e654601BEa72Ff3fB130f9ed2aa7",
    stakingContract_zombieVan: "0x67275189e0deb3ce9eb918928c0011a0a582bd0e",
    stakingContract_iceCreamZombies:
      "0x581b6d860aa138c46dcaf6d5c709cd070cd77eb8",
    slush: "0xac45ede2098bc989dfe0798b4630872006e24c3f",
  },
  mantle: {
    stakingContract_iceCreamVan: "0xe0ac81c7692b9119658e01edc1d743bf4c2ec21a",
    stakingContract_zombieVan: "0x049a58a2aa1b15628aa0cda0433d716f6f63cbba",
    stakingContract_iceCreamZombies:
      "0x21b276de139ce8c75a7b4f750328dbf356195b49",
    slush: "0x8309bc8bb43fb54db02da7d8bf87192355532829",
  },
};

const config = {
  mantle: {
    endpoint:
      "https://subgraph-api.mantle.xyz/subgraphs/name/cryptoalgebra/analytics",
  },
  telos: {
    endpoint:
      "https://telos.subgraph.swapsicle.io/subgraphs/name/cryptoalgebra/analytics",
  },
};

const query = `{
  pools {
    id
    token0 { id }
    token1 { id }
  }
}`;

const slushPriceQuery = `{
    token(id: "TOKENID") {
      derivedMatic
    }
}`;

const WTLOS = ADDRESSES.telos.WTLOS;
const WMNT = ADDRESSES.mantle.WMNT;

function getTLOSAddress(address) {
  return `telos:${address}`;
}

function getMantleAddress(address) {
  return `mantle:${address}`;
}

async function slushToEthConvert(slushAmount, chain) {
  const slushETH = await cachedGraphQuery(
    "swapsicle-slush-eth-price/" + chain,
    chain == "telos" ? config.telos.endpoint : config.mantle.endpoint,
    slushPriceQuery.replace(
      "TOKENID",
      chain == "telos" ? contracts.telos.slush : contracts.mantle.slush
    )
  );

  const slushStaked = slushAmount / 10 ** 18;
  return slushStaked * slushETH.token.derivedMatic;
}

async function iceCreamVanStake({ chain, telos: block }) {
  const tokenBalance =
    chain == "telos"
      ? await sdk.api.abi.call({
          target: contracts.telos.stakingContract_iceCreamVan,
          abi: iceCreamVanABI.totalShares,
          chain: "telos",
          block,
        })
      : await sdk.api.abi.call({
          target: contracts.mantle.stakingContract_iceCreamVan,
          abi: iceCreamVanABI.totalShares,
          chain: "mantle",
          block,
        });

  const ETHBalance = await slushToEthConvert(tokenBalance.output, chain);

  const balances = {};
  balances[chain == "telos" ? getTLOSAddress(WTLOS) : getMantleAddress(WMNT)] =
    ETHBalance * 10 ** 18;

  return balances;
}

async function ZombieVanStake({ chain, telos: block }) {
  const tokenBalance =
    chain == "telos"
      ? await sdk.api.abi.call({
          target: contracts.telos.stakingContract_zombieVan,
          abi: zombieVanABI.totalStaked,
          chain: "telos",
          block,
        })
      : await sdk.api.abi.call({
          target: contracts.mantle.stakingContract_zombieVan,
          abi: zombieVanABI.totalStaked,
          chain: "mantle",
          block,
        });

  const ETHBalance = await slushToEthConvert(tokenBalance.output, chain);

  const balances = {};
  balances[chain == "telos" ? getTLOSAddress(WTLOS) : getMantleAddress(WMNT)] =
    ETHBalance * 10 ** 18;

  return balances;
}

async function ICZStake({ chain, telos: block }) {
  const tokenBalance =
    chain == "telos"
      ? await sdk.api.erc20.balanceOf({
          target: contracts.telos.slush,
          owner: contracts.telos.stakingContract_iceCreamZombies,
          chain: "telos",
          block,
        })
      : await sdk.api.erc20.balanceOf({
          target: contracts.mantle.slush,
          owner: contracts.mantle.stakingContract_iceCreamZombies,
          chain: "mantle",
          block,
        });

  const ETHBalance = await slushToEthConvert(tokenBalance.output, chain);

  const balances = {};
  balances[chain == "telos" ? getTLOSAddress(WTLOS) : getMantleAddress(WMNT)] =
    ETHBalance * 10 ** 18;

  return balances;
}

Object.keys(config).forEach((chain) => {
  const { endpoint } = config[chain];
  module.exports[chain].staking = sdk.util.sumChainTvls([
      () => iceCreamVanStake({ chain }),
      () => ZombieVanStake({ chain }),
      // NFT's
      () => ICZStake({ chain }),
    ])
});
