const Abis = require("./abi.json");
const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");

const Contracts = {
  fantom: {
    wftm: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
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

  const data = await sdk.api.abi.call({
    target: Contracts.fantom.bank,
    abi: Abis.bank.usableFtmBalance,
    chain: chain,
    block,
  });

  return { [`fantom:${Contracts.fantom.wftm}`]: data.output };
}

async function calcStakingTvl(timestamp, ethBlock, chainBlocks) {
  const block = chainBlocks.fantom;
  const chain = "fantom";

  const data = await sdk.api.abi.call({
    target: Contracts.fantom.multiFeeDistribution,
    abi: Abis.multiFeeDistribution.totalSupply,
    chain: chain,
    block,
  });

  return { [`fantom:${Contracts.fantom.fxm}`]: data.output };
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
  return await calcPool2(
    Contracts.fantom.chef,
    Contracts.fantom.lps,
    chainBlocks.fantom,
    "fantom"
  );
}

module.exports = {
  fantom: {
    tvl: calcTvl,
    pool2: ftmPool2,
    staking: calcStakingTvl
  },
};
