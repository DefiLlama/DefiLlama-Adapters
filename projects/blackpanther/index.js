const {
  queryContract: queryContractCosmos,
} = require("../helper/chain/cosmos");
const sdk = require("@defillama/sdk");

// For testing run
// node test.js projects/blackpanther/index.js

const config = {
  injective: {
    coinGeckoId: "injective-protocol",
    decimals: 18,
    farms: [
      "inj10ahageqx7guq38w3xylmrjf8vm632x76t6l5ef",
      "inj1yq8scr85pfwwdq240pa3gq2gsht5echnf223yp",
      "inj1uf2gyjzxy4l3xt7u4sg3t3x2nl4dfarugzcv74",
      "inj1yy2unvp0v49yqp8y6menjvsxd3w7720pusgt97",
      "inj12azrw3jjpnu05wd2mfpamfwse268qdgl32fnmq",
      "inj1vh4j56pf5x4sp8a3xklj0v3sq73y6cs4qvul7s",
      "inj1rcjtkmfyymcdm03alslr890khuzmzn7jxy5zgt",
      "inj1jtvgvktz7vx7yvk04ahwg54h0rd6llfknns20m",
      "inj1u22ygdfu4vq5yvcqlum7u77ac20re7hz4uxc6h",
      "inj1mrfsm3c8psn6vaznxh7ewgsp4zn5vldaq54lqu",    
    ],
    coinGeckoMap: {
      "peggy0xdAC17F958D2ee523a2206206994597C13D831ec7": "tether",
    },
  },  
};

let assetDecimals = {
  "factory/neutron1ug740qrkquxzrk2hh29qrlx3sktkfml3je7juusc2te7xmvsscns0n2wry/wstETH": 18,
  "ibc/A585C2D15DCD3B010849B453A2CFCB5E213208A5AB665691792684C26274304D": 18,
};

function getDecimalFactorAsset(asset) {
  let decimals = assetDecimals[asset] ?? 6;
  return Math.pow(10, decimals);
}


async function farm2Tvl(chain, farm) {
  const res = await queryContractCosmos({
    chain: chain,
    contract: farm,
    data: { total_vault: {} },
  });

  let token1 = {
    denom:
      res.asset[0].info?.native_token?.denom ||
      res.asset[0].info?.token?.contract_addr,
    amount: +res.asset[0].amount,
  };

  token1.coinGeckoId = getCoinGeckoId(chain, token1.denom);
  let assetDecimals1 = getDecimalFactorAsset(token1.denom);

  let results = [];
  if (token1.coinGeckoId) {
    results.push({ [token1.coinGeckoId]: token1.amount / assetDecimals1 });    
  }

  return merge(results);
}

function getCoinGeckoId(chain, denom) {
  return config[chain].coinGeckoMap[denom];
}

async function mergePromises(elements) {
  let results = await Promise.all(elements);
  return merge(results);
}

function merge(elements) {
  return elements.reduce((combined, current) => {
    for (const [coinGeckoId, amount] of Object.entries(current)) {
      if (!combined[coinGeckoId]) {
        combined[coinGeckoId] = 0;
      }

      combined[coinGeckoId] += amount;
    }

    return combined;
  }, {});
}

async function productsTvl(chain) {
  let chainConfig = config[chain];
  try {
    let result = await mergePromises([    
      ...(chainConfig.farms ?? []).map((farm) => farm2Tvl(chain, farm)),
    ]);
    return result
  } catch (error) {
    let url = error?.response?.config?.url;
    if (url) {
      sdk.log("Issue calling", error?.response?.config?.url);
    }
    throw error;
  }
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: "Asset Management Protocol",
  injective: { tvl: () => productsTvl("injective") },
};
