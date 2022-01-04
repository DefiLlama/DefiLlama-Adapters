const sdk = require("@defillama/sdk");
const { transformBscAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { BigNumber } = require("bignumber.js");
const { stakingPricedLP } = require("../helper/staking");

const squidToken = "0xAE61e7dc989718E700C046a2483e93513eDCA484";
const masterchef = "0x86A47ddD4c6522251d6a5A5800f3F24c03332CB4";
const squidBnbLP = "0x2e0484D3684701dC032f29cce59c785A5837B34E";

const solWbnbLP = {
  lpToken: "0x9d5B48AD38748c6DBD77399eccE3FD8B6f980456",
  token0: ["solana"],
  token1: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
};

const getReserves = {
  constant: true,
  inputs: [],
  name: "getReserves",
  outputs: [
    { internalType: "uint112", name: "_reserve0", type: "uint112" },
    { internalType: "uint112", name: "_reserve1", type: "uint112" },
    { internalType: "uint32", name: "_blockTimestampLast", type: "uint32" },
  ],
  payable: false,
  stateMutability: "view",
  type: "function",
};

async function tvl(timestamp, chain, chainBlocks) {
  let balances = {};

  const transformedAddress = await transformBscAddress();

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
  tvl,
};
