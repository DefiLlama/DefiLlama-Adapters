const sdk = require("@defillama/sdk");
const { BigNumber } = require("bignumber.js");
const {staking} = require('../helper/staking')
const {compoundExports} = require('../helper/compound')

const tqOne = "0x34B9aa82D89AE04f0f546Ca5eC9C93eFE1288940"; // tqONE
const markets = [
  "0xd9c0D8Ad06ABE10aB29655ff98DcAAA0E059184A", // tq1WBTC
  "0xc63AB8c72e636C9961c5e9288b697eC5F0B8E1F7", // tq1ETH
  "0xCa3e902eFdb2a410C952Fd3e4ac38d7DBDCB8E96", // tq1USDC
  "0x7af2430eFa179dB0e76257E5208bCAf2407B2468", // tq1USDT
  "0x973f22036A0fF3A93654e7829444ec64CB37BD78", // tqstONE
];

const stONEAddr = "0x22D62b19b7039333ad773b7185BB61294F3AdC19"; // stONE ERC20 contract

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

  // Add ONE amount locked in Liquid Staking
  // https://docs.tranquil.finance/liquid-staking-stone/tranquil-stone
  const stoneBalance = (await sdk.api.abi.call({
    block: chainBlocks.harmony,
    target: stONEAddr,
    abi: 'erc20:totalSupply',
    chain: 'harmony'
  })).output;

  sdk.util.sumSingleBalance(balances, `harmony:${stONEAddr}`, stoneBalance);

  return balances;
}

const tranqWONESushiLP = "0x643f94fc0a804ea13adb88b9e17244bf94022a25";
const stoneWONESushiLP = "0x6b53ca1ed597ed7ccd5664ec9e03329992c2ba87";
const tranqToken = "0xcf1709ad76a79d5a60210f23e81ce2460542a836";
const wOne = "0xcf664087a5bb0237a0bad6742852ec6c8d69a27a";

async function tranqWONE_pool2(balances, timestamp, chain, chainBlocks) {
  let { output: balance } = await sdk.api.abi.multiCall({
    calls: [
      {
        target: tranqToken,
        params: tranqWONESushiLP,
      },
      {
        target: wOne,
        params: tranqWONESushiLP,
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
}

async function stoneWONE_pool2(balances, timestamp, chain, chainBlocks) {
  let { output: balance } = await sdk.api.abi.multiCall({
    calls: [
      {
        target: stONEAddr,
        params: stoneWONESushiLP,
      },
      {
        target: wOne,
        params: stoneWONESushiLP,
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
    `harmony:${stONEAddr}`,
    balance[0].output
  );
  sdk.util.sumSingleBalance(balances, ["wrapped-one"], oneBalance);
}

async function pool2(timestamp, chain, chainBlocks) {
  let balances = {};
  await tranqWONE_pool2(balances, timestamp, chain, chainBlocks);
  await stoneWONE_pool2(balances, timestamp, chain, chainBlocks);


  return balances;
}

const xtranqToken = "0xb4aa8c8e555b3a2f1bfd04234ff803c011760e59";
const stakingContract = "0x59a4d6b2a944e8acabbd5d2571e731388918669f";

module.exports = {
  methodology: "TVL includes values locked into TqTokens and stONE liquid staking. Pool2 are the liquidity in the TRANQ-WONE and stONE-ONE SUSHI LPs. Staking TVL are the xTRANQ tokens locked into the staking contract.",
  harmony: {
    ...compoundExports("0x6a82A17B48EF6be278BBC56138F35d04594587E3", "harmony", tqOne, wOne),
    pool2,
    staking: staking(stakingContract, xtranqToken, "harmony"),
  },
};
