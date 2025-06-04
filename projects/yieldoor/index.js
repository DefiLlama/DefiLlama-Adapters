const { toUSDTBalances } = require('../helper/balances');
const { BigNumber } = require('bignumber.js');
const { gql, default: request } = require('graphql-request');

const getSubgraphUrl = (chain) => {
  let subgraphUrl;
  if (chain === "base") {
    subgraphUrl = "https://subgraph.satsuma-prod.com/ebe562dbf792/yieldoor--594520/yieldoor-leverager-base/version/v0.0.2/api";
  } else if (chain === "sonic") {
    subgraphUrl = "https://subgraph.satsuma-prod.com/ebe562dbf792/yieldoor--594520/yieldoor-leverager-sonic/version/v0.0.2/api";
  }
  return subgraphUrl;
};

const yieldoorReservesQuery = gql`
  query Reserves {
    reserves(orderBy: asset) {
      id
      asset
      borrowingIndex
      currentBorrowingRate
      totalBorrows
      yTokenAddress
      stakingAddress
      reserveCapacity
      borrowingRateConfig_utilizationA
      borrowingRateConfig_borrowingRateA
      borrowingRateConfig_utilizationB
      borrowingRateConfig_borrowingRateB
      borrowingRateConfig_maxBorrowingRate
      leverageParams_maxIndividualBorrow
      leverageParams_LTV
      leverageParams_LLTV
      underlyingBalance
      flags_isActive
      flags_frozen
      flags_borrowingEnabled
    }
  }
`;


const vaultAbi = {
  "balances": "function balances() view returns (uint256, uint256)",
  "price": "function price() returns (uint256)",
  "token1": "function token1() view returns (address)"
}

const loopedVaultAbi = {
  "totalAssets": "function totalAssets() view returns (uint256)"
}

const priceFeedAbi = {
  "getPrice": "function getPrice(address asset) view returns (uint256)"
}

const contracts = {
  ethereum: {
    pricefeed: "0xe4BD4A83c58d93F370f10e4e172259e074c89daB",
    lendingPool: "",
    lp: [],
    looped: [
      {
        address: "0x67d0bde18945999ff517a04fa156189a07ba6543",
        asset: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        decimals: 6
      }
    ]
  },
  base: {
    pricefeed: "0x8deb1b8b802e27593d631dada78befb166bab8ce",
    lendingPool: "0xa35b16cec42094f3ba4fd838b13641ec77d23f98",
    lp: [
      {
        address: "0x8e16c184df379196782e943f4d5a2682a8720cc4",
        assets: [
          {
            address: "0x4200000000000000000000000000000000000006",
            decimals: 18
          },
          {
            address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
            decimals: 6
          }
        ]
      },
      {
        address: "0x92ed462970e63b4fe955937cb1741ef5218b8e40",
        assets: [
          {
            address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
            decimals: 6
          },
          {
            address: "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
            decimals: 8
          }
        ]
      },
      {
        address: "0x90d8da2839570901f13124ab1a83e92764c7e08f",
        assets: [
          {
            address: "0x4200000000000000000000000000000000000006",
            decimals: 18
          },
          {
            address: "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
            decimals: 8
          }
        ]
      },
      {
        address: "0xc01403a2466aa7a52a7826a15e5e3bc6b0cd0664",
        assets: [
          {
            address: "0x4200000000000000000000000000000000000006",
            decimals: 18
          },
          {
            address: "0xbaa5cc21fd487b8fcc2f632f3f4e8d37262a0842",
            decimals: 18
          }
        ]
      }
    ],
    looped: []
  },
  sonic: {
    pricefeed: "0x8bfe9fb5b5a3bcfef6fa4e05b1ef9a9256f0776f",
    lendingPool: "0x2300ddbc84ee0c375920d706882b62d1babe1dcb",
    lp: [
      {
        "address": "0x6120de6a13e4496d6c8220bb2a0727ec6350a37f",
        "assets": [
          {
            "address": "0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38",
            "decimals": 18
          },
          {
            "address": "0x29219dd400f2bf60e5a23d13be72b486d4038894",
            "decimals": 6
          }
        ]
      },
      {
        "address": "0xbce4fdcc570855d1f8f7aa2b29a483bdab6cc2df",
        "assets": [
          {
            "address": "0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38",
            "decimals": 18
          },
          {
            "address": "0x50c42deacd8fc9773493ed674b675be577f2634b",
            "decimals": 18
          }
        ]
      },
      {
        "address": "0x2d4d9ec91b60b2bf29ed1ec5028847dd8237cc17",
        "assets": [
          {
            "address": "0x29219dd400f2bf60e5a23d13be72b486d4038894",
            "decimals": 6
          },
          {
            "address": "0x50c42deacd8fc9773493ed674b675be577f2634b",
            "decimals": 18
          }
        ]
      },
      {
        "address": "0x55a9a1444dc5ffeff94090c1e31e1a0c2d5da963",
        "assets": [
          {
            "address": "0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38",
            "decimals": 18
          },
          {
            "address": "0x29219dd400f2bf60e5a23d13be72b486d4038894",
            "decimals": 6
          }
        ]
      },
      {
        "address": "0xea2dcb8f95d2582f3dfcf8fb9c13488e8dfbbfa3",
        "assets": [
          {
            "address": "0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38",
            "decimals": 18
          },
          {
            "address": "0x50c42deacd8fc9773493ed674b675be577f2634b",
            "decimals": 18
          }
        ]
      },
      {
        "address": "0xdc8bf0e7ff1742898f8e72143f0b8ab4139272e5",
        "assets": [
          {
            "address": "0x29219dd400f2bf60e5a23d13be72b486d4038894",
            "decimals": 6
          },
          {
            "address": "0x50c42deacd8fc9773493ed674b675be577f2634b",
            "decimals": 18
          }
        ]
      },
      {
        "address": "0x520e0c1a9071227279b1bec01e2fc93a25c5094e",
        "assets": [
          {
            "address": "0x29219dd400f2bf60e5a23d13be72b486d4038894",
            "decimals": 6
          },
          {
            "address": "0xe715cba7b5ccb33790cebff1436809d36cb17e57",
            "decimals": 6
          }
        ]
      }
    ],
    looped: [],
    shadow: []
  }
}

const calculateBalanceInToken1 = (data) => {
  let diffDecimals = data.decimals0 - data.decimals1;
  let price = (new BigNumber(data.spotPrice))
    .dividedBy('1e30')
    .multipliedBy(new BigNumber(10).pow(diffDecimals));

  const balance0 = new BigNumber(data.rawBalance0).dividedBy(10 ** data.decimals0);
  const balance1 = new BigNumber(data.rawBalance1).dividedBy(10 ** data.decimals1);

  return balance1.plus(balance0.times(price));
};


async function fetchLpVaultBalances(api) {
  const vaults = contracts[api.chain].lp;

  if (!vaults.length) return new BigNumber(0);

  let totalLpTvl = new BigNumber(0);

  const vaultAddresses = vaults.map(v => v.address);
  const assets1 = vaults.map(v => v.assets[1].address);

  const balances = await api.multiCall({ abi: vaultAbi.balances, calls: vaultAddresses });
  const spotPriceToken0Token1 = await api.multiCall({ abi: vaultAbi.price, calls: vaultAddresses });
  const priceOfToken1 = await api.multiCall({ abi: priceFeedAbi.getPrice, calls: assets1, target: contracts[api.chain].pricefeed });
  const priceOfToken0Div1e18 = priceOfToken1.map(p => new BigNumber(p).div('1e18'));

  for (let i = 0; i < vaults.length; i++) {
    const balanceInToken1 = calculateBalanceInToken1({
      rawBalance0: balances[i][0],
      rawBalance1: balances[i][1],
      decimals0: vaults[i].assets[0].decimals,
      decimals1: vaults[i].assets[1].decimals,
      spotPrice: spotPriceToken0Token1[i]
    });

    const tvl = priceOfToken0Div1e18[i].times(balanceInToken1);

    totalLpTvl = totalLpTvl.plus(tvl);
  }

  return totalLpTvl;
}

async function fetchLoopedVaultBalances(api) {
  const vaultAddresses = contracts[api.chain].looped.map(v => v.address);
  const assets = contracts[api.chain].looped.map(v => v.asset);
  const decimals = contracts[api.chain].looped.map(v => v.decimals);

  const balances = await api.multiCall({ abi: loopedVaultAbi.totalAssets, calls: vaultAddresses });
  const prices = await api.multiCall({ abi: priceFeedAbi.getPrice, calls: assets, target: contracts[api.chain].pricefeed });

  let totalLoopedTvl = new BigNumber(0);

  for (let i = 0; i < vaultAddresses.length; i++) {
    const tvl = new BigNumber(balances[i]).div(10 ** decimals[i]).times(prices[i]).div('1e18');
    totalLoopedTvl = totalLoopedTvl.plus(tvl);  
  }

  return totalLoopedTvl;
}

async function fetchMarketStats(api) {
  if (contracts[api.chain].lendingPool === '' || contracts[api.chain].lendingPool === undefined) return new BigNumber(0);

  const subgraphUrl = getSubgraphUrl(api.chain);
  const reserves = await request(subgraphUrl, yieldoorReservesQuery);

  const reserveAddresses = reserves.reserves.map(r => r.asset);
  const decimals = await api.multiCall({ abi: "erc20:decimals", calls: reserveAddresses });
  let prices = await api.multiCall({ abi: priceFeedAbi.getPrice, calls: reserveAddresses, target: contracts[api.chain].pricefeed });
  prices = prices.map(p => new BigNumber(p).div('1e18'));

  const tvls = {}

  await Promise.all(reserves.reserves.map(async (reserve, i) => {
    const totalSupplied = new BigNumber(reserve.underlyingBalance)
      .plus(reserve.totalBorrows)
      .div(10 ** decimals[i]);
  
    const totalBorrowed = new BigNumber(reserve.totalBorrows)
      .div(10 ** decimals[i]);
  
    const totalSuppliedUsd = totalSupplied.times(prices[i]);
    const totalBorrowedUsd = totalBorrowed.times(prices[i]);
  
    const tvl = totalSuppliedUsd.minus(totalBorrowedUsd);
    tvls[reserve.asset] = tvl;
  }));

  const totalTvl = Object.values(tvls).reduce((a, b) => a.plus(b), new BigNumber(0));

  return totalTvl;
}

const chains = {
  ethereum: 1,
  base: 8453,
  sonic: 146,
}

async function tvl(api) {
  const vaultTvl = await fetchLpVaultBalances(api);
  const loopedVaultTvl = await fetchLoopedVaultBalances(api);
  const lendingTvl = await fetchMarketStats(api);

  return toUSDTBalances(vaultTvl.plus(loopedVaultTvl).plus(lendingTvl));
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  doublecounted: true,
}

Object.keys(chains).forEach(chain => {
  module.exports[chain] = { tvl }
})
