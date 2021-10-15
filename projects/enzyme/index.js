const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request");
const queryUrl = "https://api.thegraph.com/subgraphs/name/enzymefinance/enzyme";
const { BigNumber } = require("bignumber.js");

/*
  STAKEHOUND NO TVL 
  NO CHAI TVL 
  For CRV and UNI, TVL = networkAssetHolding.amount * price.price
  which results in TVL in ETH which can be converted with sumSingleBalance()
  Ignore "0x06325440d014e39736583c165c2963ba99faf14e", no TVL there 
  "0x2e59005c5c0f0a4d77cca82653d48b46322ee5cd" is sXTZ which hasn't been updated by CoinGecko as of this commit
*/

async function query(derivative, queryUrl) {
  let queryField;
  switch (derivative) {
    case "CurvePool":
    case "UniswapPool":
      queryField = gql`
        query getPools($block: Int) {
          assets(where: { derivativeType: ${derivative} }, block: $block) {
            id
            decimals
            networkAssetHolding {
              amount
            }
            price {
              price
            }
          }
        }
      `;
      break;

    default:
      queryField = gql`
      query getResults($block: Int) {
        assets(where: { derivativeType: ${derivative}}, block: $block) {
          id
          decimals
          underlyingAsset {
            id
            decimals
          }
          networkAssetHolding {
            amount
          }
        }
      }
      `;
      break;
  }

  let { assets: result } = await request(queryUrl, queryField);

  return result;
}

const wEth = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"; // WETH contract
const stakingAddress = "0xec67005c4e498ec7f55e092bd1d35cbc47c91892"; // MLN staking
const pool2Address = "0x15ab0333985fd1e289adf4fbbe19261454776642"; // WETH/MLN (UNI-V2)

async function calcTvl(balances, assets, derivative) {
  for (let i = 0; i < assets.length; i++) {
    switch (derivative) {
      case "comp":
        if (assets[i].networkAssetHolding !== null) {
          let asset = assets[i].id;
          let assetHolding = assets[i].networkAssetHolding.amount;
          let decimals = assets[i].decimals;
          let balance = BigNumber(assetHolding)
            .times(10 ** Number(decimals))
            .toFixed(0);
          sdk.util.sumSingleBalance(balances, asset, balance);
        }
        break;

      case "null":
      case "snx":
        if (
          assets[i].networkAssetHolding !== null &&
          assets[i].networkAssetHolding.amount !== "0" &&
          assets[i].id !== stakingAddress
        ) {
          let asset = assets[i].id;
          let assetHolding = assets[i].networkAssetHolding.amount;
          let decimals = assets[i].decimals;
          let balance = BigNumber(assetHolding)
            .times(10 ** Number(decimals))
            .toFixed(0);

          sdk.util.sumSingleBalance(balances, asset, balance);
        }
        break;

      case "crv":
      case "uni":
        if (
          assets[i].networkAssetHolding !== null &&
          assets[i].networkAssetHolding.amount !== "0" &&
          assets[i].id !== pool2Address
        ) {
          let assetHolding = assets[i].networkAssetHolding.amount;
          let decimals = assets[i].decimals;
          let price = assets[i].price.price;
          let balance = BigNumber(assetHolding)
            .times(price)
            .times(10 ** Number(decimals))
            .toFixed(0);
          sdk.util.sumSingleBalance(balances, wEth, balance);
        }
        break;

      default:
        if (
          assets[i].networkAssetHolding !== null &&
          assets[i].networkAssetHolding.amount !== "0"
        ) {
          let assetHolding = assets[i].networkAssetHolding.amount;
          let asset = assets[i].underlyingAsset.id;
          let decimals = assets[i].underlyingAsset.decimals;
          let balance = BigNumber(assetHolding)
            .times(10 ** Number(decimals))
            .toFixed(0);
          sdk.util.sumSingleBalance(balances, asset, balance);
        }
        break;
    }
  }
}

async function ethTvl(timestamp, block) {
  let balances = {};

  //AAVE
  let aaveAssets = await query("Aave", queryUrl, "aave");
  await calcTvl(balances, aaveAssets, "aave");

  //COMP
  let compAssets = await query("Compound", queryUrl, "comp");
  await calcTvl(balances, compAssets, "comp");

  //ALPHA
  let alphaAssets = await query("Alpha", queryUrl, "alpha");
  await calcTvl(balances, alphaAssets, "alpha");

  //IDLE
  let idleAssets = await query("Idle", queryUrl, "idle");
  await calcTvl(balances, idleAssets, "idle");

  //SNX
  let snxAssets = await query("Synthetix", queryUrl, "snx");
  await calcTvl(balances, snxAssets, "snx");

  //UNI
  let uniAssets = await query("UniswapPool", queryUrl, "uni");
  await calcTvl(balances, uniAssets, "uni");

  //CRV
  let crvAssets = await query("CurvePool", queryUrl, "crv");
  await calcTvl(balances, crvAssets, "crv");

  //YEARN
  let yearnAssets = await query("Yearn", queryUrl, "yearn");
  await calcTvl(balances, yearnAssets, "yearn");

  //NULL
  let nullAssets = await query("null", queryUrl, "null");
  await calcTvl(balances, nullAssets, "null");

  return balances;
}

async function staking(timestamp, block) {
  let balances = {};
  let query = gql`
  query getResults($block: Int) {
    asset(id: "${stakingAddress}", block: $block) {
      id
          decimals
          underlyingAsset {
            id
            decimals
          }
          networkAssetHolding {
            amount
          }
    }
  }
  `;
  let { asset: result } = await request(queryUrl, query);

  let asset = result.id;
  let assetHolding = result.networkAssetHolding.amount;
  let decimals = result.decimals;
  let balance = BigNumber(assetHolding)
    .times(10 ** Number(decimals))
    .toFixed(0);

  sdk.util.sumSingleBalance(balances, asset, balance);
  return balances;
}

async function pool2(timestamp, block) {
  let balances = {};
  let query = gql`
  query getResults($block: Int) {
    asset(id: "${pool2Address}", block: $block) {
      id
      decimals
      networkAssetHolding {
        amount
      }
      price {
        price
      }
    }
  }
  `;
  let { asset: result } = await request(queryUrl, query);

  let assetHolding = result.networkAssetHolding.amount;
  let decimals = result.decimals;
  let price = result.price.price;
  let balance = BigNumber(assetHolding)
    .times(price)
    .times(10 ** Number(decimals))
    .toFixed(0);
  sdk.util.sumSingleBalance(balances, wEth, balance);
  return balances;
}

module.exports = {
  ethereum: {
    tvl: ethTvl,
    staking,
    pool2
  }
};
