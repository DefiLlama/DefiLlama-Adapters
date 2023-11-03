const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { BigNumber } = require("bignumber.js");
const { stakingPricedLP } = require("../helper/staking");

const squidToken = "0xAE61e7dc989718E700C046a2483e93513eDCA484";
const masterchef = "0x86A47ddD4c6522251d6a5A5800f3F24c03332CB4";
const squidBnbLP = "0x2e0484D3684701dC032f29cce59c785A5837B34E";

const solWbnbLP = {
  lpToken: "0x9d5B48AD38748c6DBD77399eccE3FD8B6f980456",
  token0: ["solana"],
  token1: ADDRESSES.bsc.WBNB,
};

const getReserves = 'function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)';

async function tvl(timestamp, chain, chainBlocks) {
  let balances = {};

  const transformedAddress = i => `bsc:${i}`;

  await addFundsInMasterChef(
    balances,
    masterchef,
    chainBlocks.bsc,
    "bsc",
    transformedAddress,
    undefined,
    [squidToken, squidBnbLP, solWbnbLP.lpToken]
  );

  let solWbnbLPBal = (
    await sdk.api.erc20.balanceOf({
      target: solWbnbLP.lpToken,
      owner: masterchef,
      block: chainBlocks.bsc,
      chain: "bsc",
    })
  ).output;

  let solWbnbLPSupply = (
    await sdk.api.erc20.totalSupply({
      target: solWbnbLP.lpToken,
      block: chainBlocks.bsc,
      chain: "bsc",
    })
  ).output;

  let solWbnbLPReserves = (
    await sdk.api.abi.call({
      target: solWbnbLP.lpToken,
      abi: getReserves,
      block: chainBlocks.bsc,
      chain: "bsc",
    })
  ).output;

  let token0Bal = Number(
    solWbnbLPReserves._reserve0 * (solWbnbLPBal / solWbnbLPSupply)
  );
  token0Bal = BigNumber(token0Bal)
    .div(10 ** 18)
    .toFixed(0);
  let token1Bal = Number(
    solWbnbLPReserves._reserve1 * (solWbnbLPBal / solWbnbLPSupply)
  );

  sdk.util.sumSingleBalance(balances, solWbnbLP.token0, token0Bal);
  sdk.util.sumSingleBalance(balances, `bsc:${solWbnbLP.token1}`, token1Bal);

  return balances;
}

module.exports = {
  bsc: {
    tvl,
    pool2: stakingPricedLP(masterchef, squidToken, "bsc", squidBnbLP, "wbnb", true),
  },
};
