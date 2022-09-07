const { sumTokens, sumTokens2 } = require("../helper/unwrapLPs");
const { sumTokensExport } = require("../helper/unknownTokens");

const GIV = "0x900db999074d9277c5da2a43f252d74366230da0";
const xdaiGIV = "0x4f4F9b8D5B4d0Dc10506e5551B0513B61fD59e75";

async function mainnetStaking(ts, block) {
  const balances = {};
  const tokensAndOwners = [
    [GIV, "0x4B9EfAE862a1755F7CEcb021856D467E86976755"], // Mainnet LM
  ];
  await sumTokens(balances, tokensAndOwners, block);
  return balances;
}

async function mainnetPools(_, block) {
  const toa = [
    [GIV, "0xbeba1666c62c65e58770376de332891b09461eeb"], // GIV / DAI Unipool
    [GIV, "0xc3151A58d519B94E915f66B044De3E55F77c2dd9"], // Angel Vault
    [GIV, "0x7819f1532c49388106f7762328c51ee70edd134c"], // GIV / ETH Balancer
  ];
  return sumTokens2({ tokensAndOwners: toa, block, resolveLP: true });
}

async function stakingXDAI(ts, EthBlock, chainBlocks) {
  const balances = {};
  const block = chainBlocks["xdai"];
  const tokensAndOwners = [
    [xdaiGIV, "0xD93d3bDBa18ebcB3317a57119ea44ed2Cf41C2F2"], // xDAI LM
  ];
  await sumTokens({
    tokensAndOwners,
    chain: "xdai",
    block,
    balances,
  });
  console.log({ balances });
  return balances;
}

async function poolXDAI() {}

module.exports = {
  methodology: "Counts GIV staked in all farms",
  ethereum: {
    tvl: () => [],
    staking: mainnetStaking,
    pool2: mainnetPools,
  },
  //   xdai: {
  //     tvl: () => [],
  //     staking: stakingXDAI,
  //     // pool2: poolXDAI,
  //   },
};
