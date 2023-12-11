const { queryContract: queryContractCosmos } = require("../helper/chain/cosmos");
const sdk = require("@defillama/sdk");

// For testing run
// node test.js projects/gryphon/index.js

const config = {
  injective: {
    coinId: "injective",
    nAssets: [
      { name: "nINJ", asset: "inj13xlpypcwl5fuc84uhqzzqumnrcfpptyl6w3vrf", decimals: 18 },
      { name: "nATOM", asset: "inj1ln2tayrlh0vl73cdzxryhkuuppkycxpna5jm87", decimals: 18 }
    ],
    oracle: "inj1f766ls9539sdqr5e9ga5j05540zvuwareh63ac",
    decimals: 18
  }
};

const assetDecimals = {
  "inj13xlpypcwl5fuc84uhqzzqumnrcfpptyl6w3vrf": 18,
  "inj1ln2tayrlh0vl73cdzxryhkuuppkycxpna5jm87": 18
};

async function getPrice(contract, chain, asset) {
  return (await queryContractCosmos({
    contract, chain, data: { query_price: { asset } }
  }))?.emv_price;
}

async function getTotalSupply(chain, contract) {
  return (await queryContractCosmos({
    contract, chain, data: { token_info: {} }
  }))?.total_supply;
}

async function nAsset2Tvl(chain, nAsset) {
  let chainConfig = config[chain];
  let coinId = chainConfig.coinId;
  let assetPrice = await getPrice(chainConfig.oracle, chain, nAsset.asset);

  let assetBalance = await getTotalSupply(chain, nAsset.asset);

  // nAsset.total_supply * nAsset.price
  let tvl = assetBalance * assetPrice / (Math.pow(10, nAsset.decimals) ?? getDecimalFactorAsset(nAsset.asset));

  return {
    [coinId]: tvl
  };
}

function getDecimalFactor(chainConfig) {
  let decimals = chainConfig.decimals ?? 18;
  return Math.pow(10, decimals);
}

function getDecimalFactorAsset(asset) {
  let decimals = assetDecimals[asset] ?? 18;
  return Math.pow(10, decimals);
}

async function mergePromises(elements) {
  let results = await Promise.all(elements);
  return merge(results);
}

function merge(elements) {
  return elements.reduce((combined, current) => {
    for (const [coinId, amount] of Object.entries(current)) {
      if (!combined[coinId]) {
        combined[coinId] = 0;
      }

      combined[coinId] += amount;
    }

    return combined;
  }, {});
}

const productsTvl = async (chain) => {
  let chainConfig = config[chain];
  try {
    let combined = await mergePromises([
      ...(chainConfig.nAssets ?? []).map((nAsset) => nAsset2Tvl(chain, nAsset))
    ]);
    return combined[chainConfig.coinId];
  } catch (error) {
    let url = error?.response?.config?.url;
    if (url) {
      sdk.log("Issue calling", error?.response?.config?.url);
    }
    throw error;
  }
};

const fetch = async () => {
  return productsTvl("injective");
};

module.exports = {
  fetch
  // timetravel: false,
  // misrepresentedTokens: true,
  // // methodology: "Gryphon Protocol",
  // injective: {
  //   tvl: (timestamp, block, chainBlocks, { api }) => productsTvl("injective", api)
  // }
};
