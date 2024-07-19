const Abis = require("./abi.json");

const Contracts = {
  cronos: {
    mmf: "0x97749c9B61F878a880DfE312d2594AE07AEd7656",
    musd: "0x95aEaF383E2e86A47c11CffdE1F7944eCB2C38C2",
    mng: "0xC9b23289c60783649AA327732FCCEc2f5d0aC466",
    bank: "0x800E2ac0A7c243420eea2bE29Cc95B2B650f7337",
    bankMusd: "0xa23608087908F3812219886bCec68c4FA77A9eE5",
    multiFeeDistribution: "0xE6F7ADf2F2aCd219Ca68136cd47C2C826a3Ba1A9",
    chef: "0x6F132536069F8E35ED029CEd563710CF68fE8E54",
  },
};

async function calcTvl(api) {
  const bankBalance = await api.call({ target: Contracts.cronos.bank, abi: Abis.bank.usableCollateralBalance, });
  const bankBalanceMusd = await api.call({ target: Contracts.cronos.bankMusd, abi: Abis.bank.usableCollateralBalance, });
  api.add(Contracts.cronos.mmf, bankBalance);
  api.add(Contracts.cronos.musd, bankBalanceMusd);
}

async function calcStaking(api) {
  const stakingData = await api.call({    target: Contracts.cronos.multiFeeDistribution,    abi: Abis.multiFeeDistribution.totalSupply,  });
  api.add(Contracts.cronos.mng, stakingData);
}

module.exports = {
  cronos: {
    tvl: calcTvl,
    pool2: () => ({}),
    staking: calcStaking,
  },
};
