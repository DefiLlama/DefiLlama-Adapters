const BigNumber = require('bignumber.js')
const Abis = require("./abi.json");
const sdk = require("@defillama/sdk");

const Contracts = {
  cronos: {
    mmf: "0x97749c9B61F878a880DfE312d2594AE07AEd7656",
    musd: "0x95aEaF383E2e86A47c11CffdE1F7944eCB2C38C2",
    mng: "0xC9b23289c60783649AA327732FCCEc2f5d0aC466",
    bank: "0x800E2ac0A7c243420eea2bE29Cc95B2B650f7337",
    bankMusd: "0xa23608087908F3812219886bCec68c4FA77A9eE5",
    multiFeeDistribution: "0xE6F7ADf2F2aCd219Ca68136cd47C2C826a3Ba1A9",
    chef: "0x6F132536069F8E35ED029CEd563710CF68fE8E54",
    mmfLps: [
      {
        address: "0xa7bE5cB8Be6484c06aBb8942fe682797bb9A76Ec", // MNG_MMF_LP
        isToken0: true
      },
      {
        address: "0x80fdDa345e707dd9e518094b9B50027D9AF148F4", // MMFX_MMF_LP
        isToken0: true
      }
    ],
    musdLps: [
      {
        address: "0x6b4D24758a65c5bB2fC377B3b45e8b020ba6A4c1", // MNG_MUSD_LP
        isToken0: true
      },
      {
        address: "0xE516830c6dE6E1b653230370CD236c78DB9F66bf", // MMUSD_MUSD_LP
        isToken0: true
      }
    ]
  },
};

async function calcTvl(timestamp, ethBlock, chainBlocks) {
  const block = chainBlocks.cronos;
  const chain = "cronos";

  const bankBalance = await sdk.api.abi.call({
    target: Contracts.cronos.bank,
    abi: Abis.bank.usableCollateralBalance,
    chain: chain,
    block,
  });

  const bankBalanceMusd = await sdk.api.abi.call({
    target: Contracts.cronos.bankMusd,
    abi: Abis.bank.usableCollateralBalance,
    chain: chain,
    block,
  });

  return {
    [`cronos:${Contracts.cronos.mmf}`]: bankBalance.output,
    [`cronos:${Contracts.cronos.musd}`]: bankBalanceMusd.output,
  };
}

async function calcStaking(timestamp, ethBlock, chainBlocks) {
  const block = chainBlocks.cronos;
  const chain = "cronos";

  const stakingData = await sdk.api.abi.call({
    target: Contracts.cronos.multiFeeDistribution,
    abi: Abis.multiFeeDistribution.totalSupply,
    chain: chain,
    block,
  });

  return {
    [`cronos:${Contracts.cronos.mng}`]: stakingData.output
  };
}

async function calcLp(lps, block, chain, baseToken) {
  const reserves = (
    await sdk.api.abi.multiCall({
      calls: lps.map((lp) => ({
        target: lp.address,
        params: [],
      })),
      abi: Abis.pair.getReserves,
      block,
      chain,
    })
  ).output;
  const totalSupplies = (
    await sdk.api.abi.multiCall({
      calls: lps.map((lp) => ({
        target: lp.address,
        params: [],
      })),
      abi: "erc20:totalSupply",
      block,
      chain,
    })
  ).output;
  const balances = (
    await sdk.api.abi.multiCall({
      calls: lps.map((lp) => ({
        target: lp.address,
        params: [Contracts.cronos.chef],
      })),
      abi: "erc20:balanceOf",
      block,
      chain,
    })
  ).output;

  const results = lps.map((lp, index) => (
    new BigNumber(reserves[index].output[lp.isToken0 ? "_reserve0" : "_reserve1"])
      .times(2)
      .times(new BigNumber(balances[index].output))
      .idiv(new BigNumber(totalSupplies[index].output))
  ));
  const total = results.reduce((total, num) => total.plus(num), new BigNumber(0));

  return {
    [`cronos:${baseToken}`]: total.toString(10),
  };
}

async function calcChef(timestamp, block, chainBlocks) {
  const farm = await calcLp(Contracts.cronos.mmfLps, chainBlocks.cronos, "cronos", Contracts.cronos.mmf);
  const farmMusd = await calcLp(Contracts.cronos.musdLps, chainBlocks.cronos, "cronos", Contracts.cronos.musd);

  return { ...farm, ...farmMusd };
}

module.exports = {
  cronos: {
    tvl: calcTvl,
    pool2: calcChef,
    staking: calcStaking,
  },
};
