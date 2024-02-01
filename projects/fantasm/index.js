const ADDRESSES = require('../helper/coreAssets.json')
const Abis = require("./abi.json");
const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");

const Contracts = {
  fantomV1: {
    wftm: ADDRESSES.fantom.WFTM,
    fsm: "0xaa621D2002b5a6275EF62d7a065A865167914801",
    bank: "0x880672AB1d46D987E5d663Fc7476CD8df3C9f937",
    multiFeeDistribution: "0x348634Ea9367690383716FbCa8f225366bbC5966",
    chef: "0x7aeE1FF33E1b7F6D874D488fb2533a79419ca240",
    lps: [
      "0x457C8Efcd523058dd58CF080533B41026788eCee", // FSM_FTM_LP
      "0x128aff18EfF64dA69412ea8d262DC4ef8bb3102d", // XFTM_FTM_LP
      "0xbEa8E843c0fD428f79a166EaE2671E3a8Cc39A0a", // FSM_XFTM_LP
    ],
  },
  fantom: {
    wftm: ADDRESSES.fantom.WFTM,
    fxm: "0x132b56763C0e73F95BeCA9C452BadF89802ba05e",
    bank: "0xa3B99CdFdDe2216AfB1D58D6108cC93fea413A76",
    multiFeeDistribution: "0xC4510604504Fd50f64499fF6186AEf1F740dE38B",
    chef: "0x9c09eA872582bA02E0008C4853eAA5199bF8D0a7",
    lps: [
      "0x664D417B404404268C4E571975B4eC77157B8aC4", // FXM_FTM_LP
      "0x215c8E1452681be980Bce575cF719029581Ef263", // FTMX_FTM_LP
    ],
  },
};

async function calcTvl(timestamp, ethBlock, chainBlocks) {
  const block = chainBlocks.fantom;
  const chain = "fantom";

  const bankBalance = await sdk.api.abi.call({
    target: Contracts.fantom.bank,
    abi: Abis.bank.usableFtmBalance,
    chain: chain,
    block,
  });

  const bankBalanceV1 = await sdk.api.abi.call({
    target: Contracts.fantomV1.bank,
    abi: Abis.bankV1.usableFtmBalance,
    chain: chain,
    block,
  });

  return {
    [`fantom:${Contracts.fantom.wftm}`]:
      +bankBalance.output + +bankBalanceV1.output,
  };
}

async function calcStakingTvl(timestamp, ethBlock, chainBlocks) {
  const block = chainBlocks.fantom;
  const chain = "fantom";

  const stakingData = await sdk.api.abi.call({
    target: Contracts.fantom.multiFeeDistribution,
    abi: Abis.multiFeeDistribution.totalSupply,
    chain: chain,
    block,
  });

  const stakingDataV1 = await sdk.api.abi.call({
    target: Contracts.fantomV1.multiFeeDistribution,
    abi: Abis.multiFeeDistribution.totalSupply,
    chain: chain,
    block,
  });

  return {
    [`fantom:${Contracts.fantom.fxm}`]: stakingData.output,
    [`fantom:${Contracts.fantomV1.fsm}`]: stakingDataV1.output,
  };
}

async function calcPool2(masterchef, lps, block, chain) {
  let balances = {};
  const lpBalances = (
    await sdk.api.abi.multiCall({
      calls: lps.map((p) => ({
        target: p,
        params: masterchef,
      })),
      abi: "erc20:balanceOf",
      block,
      chain,
    })
  ).output;
  let lpPositions = [];
  lpBalances.forEach((p) => {
    lpPositions.push({
      balance: p.output,
      token: p.input.target,
    });
  });
  await unwrapUniswapLPs(
    balances,
    lpPositions,
    block,
    chain,
    (addr) => `${chain}:${addr}`
  );
  return balances;
}

async function ftmPool2(timestamp, block, chainBlocks) {
  const farm = await calcPool2(
    Contracts.fantom.chef,
    Contracts.fantom.lps,
    chainBlocks.fantom,
    "fantom"
  );

  const farmV1 = await calcPool2(
    Contracts.fantomV1.chef,
    Contracts.fantomV1.lps,
    chainBlocks.fantom,
    "fantom"
  );
  return { ...farm, ...farmV1 };
}

module.exports = {
  fantom: {
    tvl: calcTvl,
    pool2: ftmPool2,
    staking: calcStakingTvl,
  },
};
