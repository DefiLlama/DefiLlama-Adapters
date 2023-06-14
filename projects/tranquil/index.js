const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { BigNumber } = require("bignumber.js");
const {compoundExports, getCompoundV2Tvl} = require('../helper/compound')
const { uniTvlExport } = require('../helper/calculateUniTvl.js');
const { getFixBalancesSync } = require("../helper/portedTokens");

const tqOne = "0x34B9aa82D89AE04f0f546Ca5eC9C93eFE1288940"; // tqONE
const wOne = ADDRESSES.harmony.WONE;
const stONEAddr = "0x22D62b19b7039333ad773b7185BB61294F3AdC19"; // stONE ERC20 contract
const tranqToken = "0xcf1709ad76a79d5a60210f23e81ce2460542a836";


const tranqWONESushiLP = "0x643f94fc0a804ea13adb88b9e17244bf94022a25";
const stoneWONESushiLP = "0x6b53ca1ed597ed7ccd5664ec9e03329992c2ba87";

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

async function tvl(timestamp, chain, chainBlocks) {
    const transformAddress = addr=>`harmony:${addr}`;
    const lendingMarketTvlFn = getCompoundV2Tvl("0x6a82A17B48EF6be278BBC56138F35d04594587E3", "harmony", transformAddress, tqOne, wOne, false);
    let balances = await lendingMarketTvlFn(timestamp, chain, chainBlocks);

    // Add ONE amount locked in Liquid Staking
    // https://docs.tranquil.finance/liquid-staking-stone/tranquil-stone
    const stoneBalance = (await sdk.api.abi.call({
      block: chainBlocks.harmony,
      target: stONEAddr,
      abi: 'erc20:totalSupply',
      chain: 'harmony'
    })).output;
    balances[`harmony:${stONEAddr}`]= stoneBalance;

    return balances;
}

async function borrowed(timestamp, chain, chainBlocks) {
    const transformAddress = addr=>`harmony:${addr}`;
    const lendingMarketTvlFn = getCompoundV2Tvl("0x6a82A17B48EF6be278BBC56138F35d04594587E3", "harmony", transformAddress, tqOne, wOne, true);
    return await lendingMarketTvlFn(timestamp, chain, chainBlocks);
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
    tvl: sdk.util.sumChainTvls([
      tvl,
      uniTvlExport('0xF166939E9130b03f721B0aE5352CCCa690a7726a', 'harmony'),
    ]),
     borrowed: borrowed,
     pool2: pool2,
     staking: staking,
  },
  hallmarks:[
    [1655991120, "Horizon bridge Hack $100m"],
  ],
};
