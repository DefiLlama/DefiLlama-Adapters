const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");

const { staking } = require("../helper/staking");
const { sumTokensExport } = require("../helper/unwrapLPs");
const { sumUnknownTokens } = require("../helper/unknownTokens");
const { getPriceMIM, getPriceAura, getPriceSushi } = require("./getPrice");

const prllxERC20 = require("./abis/prllxERC20.json");
const contracts = require("./contracts.json");

async function ethTvl(api) {
  const strategyId = await api.call({
    target: contracts.eth.parallaxAddress,
    params: contracts.eth.strategyAddress,
    abi: prllxERC20["strategyToId"],
  });

  const strategy = await api.call({
    target: contracts.eth.parallaxAddress,
    params: strategyId,
    abi: prllxERC20["strategies"],
  });

  const balances = {};
  const { price, decimals } = await getPriceAura(
    contracts.eth.lpAddress,
    contracts.eth.feedAddress,
    api
  );

  // const totalStaked = new BigNumber(strategy.totalStaked).div(`1e${decimals}`);
  const totalStakedTVL = price
    .times(strategy.totalStaked)
    .times(1e6)
    .toFixed(0);

  sdk.util.sumSingleBalance(
    balances,
    `ethereum:${contracts.eth.usdc}`,
    totalStakedTVL
  );

  return balances;
}

async function arbitrumTvl(api) {
  const balances = {};

  const strategyId = await api.call({
    target: contracts.arbitrum.mim.parallaxCoreAddress,
    params: contracts.arbitrum.mim.strategyAddress,
    abi: prllxERC20["strategyToId"],
  });

  const strategy = await api.call({
    target: contracts.arbitrum.mim.parallaxCoreAddress,
    params: strategyId,
    abi: prllxERC20["strategies"],
  });

  const { price, decimals } = await getPriceMIM(
    contracts.arbitrum.mim.lpAddresss,
    api
  );

  const totalStaked = new BigNumber(strategy.totalStaked).div(`1e${decimals}`);
  const totalStakedTVLMIM = price.times(totalStaked).times(1e6).toFixed(0);

  // const strategyIdOld = await api.call({
  //   target: contracts.arbitrum.mim.parallaxCoreAddressOld,
  //   params: contracts.arbitrum.mim.strategyAddressOld,
  //   abi: prllxERC20["strategyToId"],
  // })
  //
  // const strategyOld =
  //   await api.call({
  //     target: contracts.arbitrum.mim.parallaxCoreAddressOld,
  //     params: strategyIdOld,
  //     abi: prllxERC20["strategies"],
  //   })
  //
  // const totalStakedOld = new BigNumber(strategyOld.totalStaked).div(
  //   `1e${decimals}`
  // );
  // const totalStakedTVLMIMOld = price
  //   .times(totalStakedOld)
  //   .times(1e6)
  //   .toFixed(0);

  // const totalStakedTVLMIMAll =
  //   Number(totalStakedTVLMIM) + Number(totalStakedTVLMIMOld);

  sdk.util.sumSingleBalance(
    balances,
    `arbitrum:${contracts.arbitrum.mim.usdc}`,
    totalStakedTVLMIM
  );

  const strategySushiId = await api.call({
    target: contracts.arbitrum.sushi.parallaxAddr,
    params: contracts.arbitrum.sushi.strategyAddrSushi,
    abi: prllxERC20["strategyToId"],
  });

  const strategyGmxId = await api.call({
    target: contracts.arbitrum.sushi.parallaxAddr,
    params: contracts.arbitrum.sushi.strategyAddrGMX,
    abi: prllxERC20["strategyToId"],
  });

  const strategySushi = await api.call({
    target: contracts.arbitrum.sushi.parallaxAddr,
    params: strategySushiId,
    abi: prllxERC20["strategies"],
  });

  const strategyGmx = await api.call({
    target: contracts.arbitrum.sushi.parallaxAddr,
    params: strategyGmxId,
    abi: prllxERC20["strategies"],
  });

  const { sushiPrice, gmxPrice, sushiDecimals, gmxDecimals } =
    await getPriceSushi(contracts.arbitrum.sushi.parallaxBackendAddr, api);

  const totalStakedSushi = new BigNumber(strategySushi.totalStaked).div(`1e18`);
  const totalStakedGmx = new BigNumber(strategyGmx.totalStaked).div(`1e18`);

  const totalStakedTVLSushi = sushiPrice
    .times(totalStakedSushi)
    .times(1e6)
    .toFixed(0);

  const totalStakedTVLGmx = gmxPrice
    .times(totalStakedGmx)
    .times(1e6)
    .toFixed(0);

  const totalStakedTVL =
    Number(totalStakedTVLSushi) + Number(totalStakedTVLGmx);

  sdk.util.sumSingleBalance(
    balances,
    `arbitrum:${contracts.arbitrum.sushi.usdc}`,
    totalStakedTVL
  );

  return balances;
}

async function eraTvl(api) {
  if (contracts.era.length > 0) {
    for (let i = 0; i < contracts.era.length; i++) {
      const strItem = contracts.era[i];
      const strategyId = await api.call({
        target: strItem.parallaxAddress,
        params: strItem.strategyAddress,
        abi: prllxERC20["strategyToId"],
      });

      const strategy = await api.call({
        target: strItem.parallaxAddress,
        params: strategyId,
        abi: prllxERC20.strategiesERA,
      });
      const pair = strItem.lpAddress;
      api.add(pair, strategy.totalStaked);
    }
    return sumUnknownTokens({
      api,
      resolveLP: true,
      lps: contracts.era.map((strItem) => strItem.lpAddress),
    });
  }
}

module.exports = {
  methodology: "TVL comes from the Staking Vaults",
  arbitrum: {
    tvl: sdk.util.sumChainTvls([
      arbitrumTvl,
      sumTokensExport({
        owner: "0x9bab3c2ccf202edf451d76c8690c2d1716f4ae69",
        resolveUniV3: true,
      }),
    ]),
    staking: staking(
      [
        "0x82FD636D7A28a20635572EB8ec0603ee264B8651",
        "0xA3CE2c0d1cfB29F398f8f4800bA202Aba39dbbfe",
        "0x9d02A989B34aB9Af9bb4fE59604392829ddD16f5",
        "0x9f35e7c711224c704d5999b859F17A2E7CF35A16",
      ],
      "0xc8CCBd97b96834b976C995a67BF46e5754e2C48E"
    ),
    pool2: sumTokensExport({
      owner: "0x9d02A989B34aB9Af9bb4fE59604392829ddD16f5",
      resolveUniV3: true,
    }),
  },
  ethereum: {
    tvl: ethTvl,
  },
  era: {
    tvl: eraTvl,
  },
};
