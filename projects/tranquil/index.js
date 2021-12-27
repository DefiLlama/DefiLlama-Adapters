const sdk = require("@defillama/sdk");
const { BigNumber } = require("bignumber.js");
const {staking} = require('../helper/staking')
const {compoundExports} = require('../helper/compound')

const tqOne = "0x34B9aa82D89AE04f0f546Ca5eC9C93eFE1288940"; // tqONE

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

module.exports = {
  methodology: "TVL includes values locked into TqTokens. Pool2 are the liquidity in the TRANQ-WONE SUSHI LPs. Staking TVL are the xTRANQ tokens locked into the staking contract.",
  harmony: {
    ...compoundExports("0x6a82A17B48EF6be278BBC56138F35d04594587E3", "harmony", tqOne, wOne),
    pool2,
    staking: staking(stakingContract, xtranqToken, "harmony"),
  },
};
