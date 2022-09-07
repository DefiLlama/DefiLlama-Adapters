const { sumTokens, sumTokens2 } = require("../helper/unwrapLPs");
const {
  sumTokensExport,
  sumUnknownTokens,
  staking,
} = require("../helper/unknownTokens");
const utils = require("../helper/utils");

const GIV = "0x900db999074d9277c5da2a43f252d74366230da0";
const xdaiGIV = "0x4f4f9b8d5b4d0dc10506e5551b0513b61fd59e75";

async function getGIVPrice() {
  return (await utils.getPricesfromString("giveth")).data?.giveth?.usd;
}

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

async function mainnetTVL(_, block) {
  let tvl;
  const staking = await mainnetStaking(_, block);
  const pools = await mainnetPools(_, block);
  const givPrice = await getGIVPrice();
  tvl = (staking[GIV] / 10 ** 18 + pools[GIV] / 10 ** 18) * givPrice;
  return {
    dai: tvl,
  };
}

async function stakingXDAI() {
  const balance = await sumUnknownTokens({
    owners: ["0x24F2d06446AF8D6E89fEbC205e7936a602a87b60"],
    tokens: [xdaiGIV],
    chain: "xdai",
  });
  return balance;
}

async function poolXDAI() {}

async function xdaiTVL() {
  let tvl;
  const staking = await stakingXDAI();
  const givPrice = await getGIVPrice();
  tvl = (staking[`xdai:${xdaiGIV}`] / 10 ** 18) * givPrice;
  return {
    dai: tvl,
  };
}

module.exports = {
  methodology: "Counts GIV staked in all farms",
  ethereum: {
    tvl: mainnetTVL,
    staking: mainnetStaking,
    pool2: mainnetPools,
  },
  xdai: {
    tvl: xdaiTVL,
    staking: sumTokensExport({
      owners: ["0x24F2d06446AF8D6E89fEbC205e7936a602a87b60"],
      tokens: [xdaiGIV],
      chain: "xdai",
    }),
    // pool2: poolXDAI,
  },
};
