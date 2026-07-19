const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");

const { staking } = require("../helper/staking");
const { sumTokensExport } = require("../helper/unwrapLPs");
const { sumUnknownTokens } = require("../helper/unknownTokens");
const prllxERC20 = require("./abis/prllxERC20.json");

const get_virtual_price = "function get_virtual_price() view returns (uint256)";
const getRate = "function getRate() view returns (uint256)";
const latestRoundData =
  "function latestRoundData() view returns (uint80 roundId,int256 answer,uint256 startedAt,uint256 updatedAt,uint80 answeredInRound)";
const getPrice = "function getPrice() view returns (uint256 sushi,uint256 gmx)";

const getPriceMIM = async (tokenAddress, api) => {
  const priceLpWei = await api.call({
    target: tokenAddress,
    abi: get_virtual_price,
  })

  const decimals = await api.call({
    target: tokenAddress,
    abi: "erc20:decimals",
  })

  const tokenPrice = new BigNumber(priceLpWei).div(`1e${decimals}`);

  return {
    price: tokenPrice,
    decimals,
  };
};

const getPriceAura = async (
  tokenAddress,
  feedAddress,
  api
) => {
  const decimals =
    await api.call({
      target: tokenAddress,
      abi: "erc20:decimals",
    })

  const rate =
    await api.call({
      target: tokenAddress,
      abi: getRate,
    })

  const getLatestRoundData =
    await api.call({
      target: feedAddress,
      abi: latestRoundData,
    })

  const ethPriceInUSD = parseInt(getLatestRoundData.answer) / 10 ** 8;
  const priceETH = new BigNumber(rate).div(`1e${decimals}`);

  const tokenPrice = new BigNumber(priceETH * ethPriceInUSD).div(
    `1e${decimals}`
  );

  return {
    price: tokenPrice,
    decimals,
  };
};

const getPriceSushi = async (backendAddress, api) => {
  const sushiDecimals = 14,
    gmxDecimals = 8;

  const sushiGmxPrice = await api.call({
    target: backendAddress,
    abi: getPrice,
  })

  const sushiPrice = new BigNumber(sushiGmxPrice.sushi).div(
    `1e${sushiDecimals}`
  );
  const gmxPrice = new BigNumber(sushiGmxPrice.gmx).div(`1e${gmxDecimals}`);

  return {
    sushiPrice: sushiPrice,
    gmxPrice: gmxPrice,
    sushiDecimals,
    gmxDecimals,
  };
};

const contracts = {
  "eth": {
    "parallaxAddress": "0xd8935F1369E1dAc77CD37e664BC13ffdd741B962",
    "strategyAddress": "0x9E6121e89dD50B5D02362A9fdb7EC1fAd3D15725",
    "lpAddress": "0x5aee1e99fe86960377de9f88689616916d5dcabe",
    "feedAddress": "0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419",
    "usdc": ADDRESSES.ethereum.USDC
  },
  "arbitrum": {
    "mim": {
      "parallaxCoreAddress": "0x07F78cC2668F9Bb152c4026E801df68Ed3AB9858",
      "strategyAddress": "0xbf81Ba9D10F96ce0bb1206DE5F2d5B363f9796A9",
      "parallaxCoreAddressOld": "0x74A819d4925dC9f473F398863666Ac787B48e1d0",
      "strategyAddressOld": "0x7b8eFCd93ee71A0480Ad4dB06849B75573168AF4",
      "lpAddresss": "0x30dF229cefa463e991e29D42DB0bae2e122B2AC7",
      "usdc": ADDRESSES.arbitrum.USDC
    },
    "sushi": {
      "parallaxAddr": "0xDCBEA8b2142Fe5E97BE9545FCFB30af812685Fb6",
      "strategyAddrSushi": "0xb53BbF686b600857B209B863c1Bce2C83acef123",
      "strategyAddrGMX": "0xF7caD5Ec40b5980Bd741346eAeE019c6E2b5D373",
      "parallaxBackendAddr": "0x1724623a721a094f8Ba9d271c9BE8be83e64f74f",
      "usdc": ADDRESSES.arbitrum.USDC
    }
  },
  "era": [
    {
      "parallaxAddress": "0xF3D6B2418395b7441B17f39EF79fF8Ead5C0E61C",
      "strategyAddress": "0x4d737487C5A398F761A4D8bE53cEB8f42e84a094",
      "lpAddress": "0x80115c708E12eDd42E504c1cD52Aea96C547c05c",
      "poolAddress": "0x80115c708E12eDd42E504c1cD52Aea96C547c05c",
      "zkss_weth": ADDRESSES.era.WETH,
      "usdc": ADDRESSES.era.USDC
    },
    {
      "parallaxAddress": "0xF3D6B2418395b7441B17f39EF79fF8Ead5C0E61C",
      "strategyAddress": "0x94CA8B763ea7De772f0B2102A8E4738e25EdCDA2",
      "lpAddress": "0xd3D91634Cf4C04aD1B76cE2c06F7385A897F54D3",
      "poolAddress": "0xd3D91634Cf4C04aD1B76cE2c06F7385A897F54D3",
      "zkss_weth": ADDRESSES.era.WETH,
      "usdc": ADDRESSES.era.USDC
    },
    {
      "parallaxAddress": "0xF3D6B2418395b7441B17f39EF79fF8Ead5C0E61C",
      "strategyAddress": "0x53e27f89658a9Da5Fc585d2fF3f657D6Cb1E22d5",
      "lpAddress": "0x0E595bfcAfb552F83E25d24e8a383F88c1Ab48A4",
      "poolAddress": "0x0E595bfcAfb552F83E25d24e8a383F88c1Ab48A4",
      "zkss_weth": ADDRESSES.era.WETH,
      "usdc": ADDRESSES.era.USDC
    }
  ]
};

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

  api.add(contracts.eth.usdc, totalStakedTVL);

  return api.getBalances();
}

async function arbitrumTvl(api) {
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

  api.add(contracts.arbitrum.mim.usdc, totalStakedTVLMIM);

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

  api.add(contracts.arbitrum.sushi.usdc, totalStakedTVL);

  return api.getBalances();
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
