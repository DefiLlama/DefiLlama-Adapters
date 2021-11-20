const sdk = require("@defillama/sdk");
const { BigNumber } = require("bignumber.js");

const tqOne = "0x34B9aa82D89AE04f0f546Ca5eC9C93eFE1288940"; // tqONE
const markets = [
  "0xd9c0D8Ad06ABE10aB29655ff98DcAAA0E059184A", // tq1WBTC
  "0xc63AB8c72e636C9961c5e9288b697eC5F0B8E1F7", // tq1ETH
  "0xCa3e902eFdb2a410C952Fd3e4ac38d7DBDCB8E96", // tq1USDC
  "0x7af2430eFa179dB0e76257E5208bCAf2407B2468", // tq1USDT
];

const underlyingAbi = {
  stateMutability: "view",
  payable: false,
  constant: true,
  type: "function",
  outputs: [
    {
      name: "",
      type: "address",
      internalType: "address",
    },
  ],
  inputs: [],
  name: "underlying",
  signature: "0x6f307dc3",
};

async function tvl(timestamp, chain, chainBlocks) {
  let balances = {};

  let { output: oneBalance } = await sdk.api.eth.getBalance({
    target: tqOne,
    block: chainBlocks.harmony,
    chain: "harmony",
  });

  oneBalance = BigNumber(oneBalance)
    .div(10 ** 18)
    .toFixed(0);

  sdk.util.sumSingleBalance(balances, ["harmony"], oneBalance);

  let { output: marketUnderlying } = await sdk.api.abi.multiCall({
    calls: markets.map((address) => ({
      target: address,
    })),
    abi: underlyingAbi,
    block: chainBlocks.harmony,
    chain: "harmony",
  });

  let { output: marketBalances } = await sdk.api.abi.multiCall({
    calls: marketUnderlying.map((result) => ({
      target: result.output,
      params: result.input.target,
    })),
    abi: "erc20:balanceOf",
    block: chainBlocks.harmony,
    chain: "harmony",
  });

  for (let result in marketBalances) {
    sdk.util.sumSingleBalance(
      balances,
      `harmony:${marketBalances[result].input.target}`,
      marketBalances[result].output
    );
  }

  return balances;
}

const sushiLP = "0x643f94fc0a804ea13adb88b9e17244bf94022a25";
const tranqToken = "0xcf1709ad76a79d5a60210f23e81ce2460542a836";
const wOne = "0xcf664087a5bb0237a0bad6742852ec6c8d69a27a";

async function pool2(timestamp, chain, chainBlocks) {
  let balances = {};

  let { output: balance } = await sdk.api.abi.multiCall({
    calls: [
      {
        target: tranqToken,
        params: sushiLP,
      },
      {
        target: wOne,
        params: sushiLP,
      },
    ],
    abi: "erc20:balanceOf",
    block: chainBlocks.harmony,
    chain: "harmony",
  });

  let oneBalance = BigNumber(balance[1].output)
    .div(10 ** 18)
    .toFixed(0);

  sdk.util.sumSingleBalance(
    balances,
    `harmony:${tranqToken}`,
    balance[0].output
  );
  sdk.util.sumSingleBalance(balances, ["wrapped-one"], oneBalance);

  return balances;
}

const xtranqToken = "0xb4aa8c8e555b3a2f1bfd04234ff803c011760e59";
const stakingContract = "0x59a4d6b2a944e8acabbd5d2571e731388918669f";

async function staking(timestamp, chain, chainBlocks) {
  let balances = {};

  let { output: balance } = await sdk.api.erc20.balanceOf({
    target: xtranqToken,
    owner: stakingContract,
    block: chainBlocks.harmony,
    chain: "harmony",
  });

  sdk.util.sumSingleBalance(balances, `harmony:${tranqToken}`, balance);

  return balances;
}

module.exports = {
  methodology: "TVL includes values locked into TqTokens. Pool2 are the liquidity in the TRANQ-WONE SUSHI LPs. Staking TVL are the xTRANQ tokens locked into the staking contract.",
  harmony: {
    tvl,
    pool2,
    staking,
  },
  tvl,
};
