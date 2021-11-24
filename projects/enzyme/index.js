const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request");
const queryUrl = "https://api.thegraph.com/subgraphs/name/enzymefinance/enzyme";
const { BigNumber } = require("bignumber.js");
const {unwrapUniswapLPs, unwrapCrv} = require("../helper/unwrapLPs")

const mln = "0xec67005c4e498ec7f55e092bd1d35cbc47c91892";
const mlnWethPool = "0x15ab0333985fd1e289adf4fbbe19261454776642";

const derivatives = [null, "Aave", "Alpha", "Chai", "Compound", "CurvePool", "Idle", "Stakehound", "Synthetix", "UniswapPool", "Yearn"];

async function query(block, derivative) {
  const field = gql`
    query getData($block: Int) {
      assets(first: 1000, where: {derivativeType: ${derivative}}, block: {number: $block}) {
        id
        decimals
        networkAssetHolding{
          amount
        }
        underlyingAsset{
          id
          decimals
        }
      }
    }
  `
  const result = (await request(queryUrl, field, {block})).assets;
  return result;
}

async function tvl(timestamp, block) {
  let balances = {};
  let lpPositions = [];
  let crvAssets = [];
  for (let i = 0; i < derivatives.length; i++) {
    let derivative = derivatives[i];
    let results = await query(block, derivative);
    results.forEach(asset => {
      if (asset.networkAssetHolding === null || asset.networkAssetHolding.amount === "0") {
        return;
      }
      let token;
      let decimals;
      let balance;
      switch (derivative) {
        case null:
        case "Aave":
        case "Alpha":
        case "Compound":
        case "Idle":
        case "Stakehound":
        case "Synthetix":
          token = asset.id;
          if (token === mln) {
            return;
          }
          // If sXTZ convert to regular Tezos
          else if (token === "0x2e59005c5c0f0a4d77cca82653d48b46322ee5cd") {
            sdk.util.sumSingleBalance(balances, ["tezos"], BigNumber(asset.networkAssetHolding.amount).toFixed(0));
            return;
          }
          decimals = asset.decimals;
          balance = BigNumber(asset.networkAssetHolding.amount).times(10 ** Number(decimals)).toFixed(0);
          sdk.util.sumSingleBalance(balances, token, balance);
          break;
        case "Chai":
          // No results for Chai
          break;
        case "CurvePool":
          token = asset.id;
          decimals = asset.decimals;
          balance = BigNumber(asset.networkAssetHolding.amount).times(10 ** Number(decimals)).toFixed(0);
          // Handles eCRV Gauge
          if (token === "0x3c0ffff15ea30c35d7a85b85c0782d6c94e1d238") {
            sdk.util.sumSingleBalance(balances, ["ethereum"], BigNumber(asset.networkAssetHolding.amount).div(2).toFixed(0));
            sdk.util.sumSingleBalance(balances, "0x5e74c9036fb86bd7ecdcb084a0673efc32ea31cb", BigNumber(asset.networkAssetHolding.amount).times(10 ** 18).div(2).toFixed(0));
          }
          // Handles steCRV Gauge
          if (token === "0x182b723a58739a9c974cfdb385ceadb237453c28") {
            sdk.util.sumSingleBalance(balances, ["ethereum"], BigNumber(asset.networkAssetHolding.amount).div(2).toFixed(0));
            sdk.util.sumSingleBalance(balances, "0xae7ab96520de3a18e5e111b5eaab095312d7fe84", BigNumber(asset.networkAssetHolding.amount).times(10 ** 18).div(2).toFixed(0));
          }
          else{
            crvAssets.push({
              token,
              balance
            });
          }
          
          break;
        case "UniswapPool":
          token = asset.id;
          if (token === mlnWethPool) {
            return;
          }
          decimals = asset.decimals;
          balance = BigNumber(asset.networkAssetHolding.amount).times(10 ** Number(decimals)).toFixed(0);
          lpPositions.push({
            balance,
            token
          });
          break;
        case "Yearn":
          token = asset.underlyingAsset.id;
          decimals = asset.underlyingAsset.decimals;
          balance = BigNumber(asset.networkAssetHolding.amount).times(10 ** Number(decimals)).toFixed(0);
          sdk.util.sumSingleBalance(balances, token, balance);
          break;
        default:
          break;
      }
    });
  }
  
  for (let i = 0; i < crvAssets.length; i++) {
    let asset = crvAssets[i];
    // Handles eursCRV Gauge
    if (asset.token === "0x90bb609649e0451e5ad952683d64bd2d1f245840") {
      await unwrapCrv(balances, "0x194ebd173f6cdace046c53eacce9b953f28411d1", asset.balance);
    }
    // Handles a3CRV Gauge
    else if (asset.token === "0xd662908ada2ea1916b3318327a97eb18ad588b5d") {
      await unwrapCrv(balances, "0xfd2a8fa60abd58efe3eee34dd494cd491dc14900", asset.balance);
    }
    else {
      await unwrapCrv(balances, asset.token, asset.balance);
    }
  }
  await unwrapUniswapLPs(balances, lpPositions, block);

  return balances;
}

async function staking(timestamp, block) {
  let balances = {};
  const field = gql`
  query getBalance($block: Int) {
    asset(id:"0xec67005c4e498ec7f55e092bd1d35cbc47c91892", block: {number: $block}) {
      networkAssetHolding{
        amount
      }
    }
  }
  `
  let balance = (await request(queryUrl, field, {block})).asset.networkAssetHolding.amount;
  sdk.util.sumSingleBalance(balances, mln, BigNumber(balance).times(10 ** 18).toFixed(0));
  return balances;
}

async function pool2(timestamp, block) {
  let balances = {};
  let token = mlnWethPool;
  const field = gql`
  query getBalance($block: Int) {
    asset(id:"0x15ab0333985fd1e289adf4fbbe19261454776642", block: {number: $block}) {
      networkAssetHolding{
        amount
      }
    }
  }
  `
  let balance = (await request(queryUrl, field, {block})).asset.networkAssetHolding.amount;
  balance = BigNumber(balance).times(10 ** 18).toFixed(0);
  await unwrapUniswapLPs(balances, [{balance, token}], block);
  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl,
    staking,
    pool2
  }
};
