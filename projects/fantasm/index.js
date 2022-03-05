const Abis = require("./abi.json");
const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");

const Contracts = {
  fantom: {
    wftm: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
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

  return { [`fantom:${Contracts.fantom.fsm}`]: data.output };
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
