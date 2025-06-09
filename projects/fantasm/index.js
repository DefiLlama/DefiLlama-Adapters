const ADDRESSES = require('../helper/coreAssets.json')
const Abis = require("./abi.json");
const { sumTokens2 } = require("../helper/unwrapLPs");

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

async function calcTvl(api) {
  const bal = await api.call({  abi: Abis.bank.usableFtmBalance, target: Contracts.fantom.bank})
  const balV1 = await api.call({  abi: Abis.bankV1.usableFtmBalance, target: Contracts.fantomV1.bank})
  api.addGasToken([bal, balV1])
}

async function calcStakingTvl(api) {
  const bals  = await api.multiCall({  abi: Abis.multiFeeDistribution.totalSupply, calls: [
    Contracts.fantom.multiFeeDistribution,
    Contracts.fantomV1.multiFeeDistribution,
  ] })
  api.add(Contracts.fantom.fxm, bals[0])
  api.add(Contracts.fantomV1.fsm, bals[1])
}

async function ftmPool2(api) {
  return sumTokens2({ api, resolveLP: true, ownerTokens: [
    [Contracts.fantom.lps, Contracts.fantom.chef],
    [Contracts.fantomV1.lps, Contracts.fantomV1.chef],
  ]})
}

module.exports = {
  fantom: {
    tvl: calcTvl,
    pool2: ftmPool2,
    staking: calcStakingTvl,
  },
};
