const { sumTokens, sumTokens2 } = require("../helper/unwrapLPs");
const { sumUnknownTokens } = require("../helper/unknownTokens");

const GIV = "0x900db999074d9277c5da2a43f252d74366230da0";
const xdaiGIV = "0x4f4f9b8d5b4d0dc10506e5551b0513b61fd59e75";

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
  return sumTokens2({ tokensAndOwners: toa, block });
}

async function stakingXDAI() {
  const balance = await sumUnknownTokens({
    owners: ["0x24F2d06446AF8D6E89fEbC205e7936a602a87b60"], // GIV Garden
    tokens: [xdaiGIV],
    chain: "xdai",
  });
  return balance;
}

async function poolXDAI() {
  const balance = await sumUnknownTokens({
    owners: [
      "0x08ea9f608656A4a775EF73f5B187a2F1AE2ae10e", // GIV / HNY
      "0x55FF0cef43F0DF88226E9D87D09fA036017F5586", // GIV / ETH
      "0xB7189A7Ea38FA31210A79fe282AEC5736Ad5fA57", // GIV / XDAI
    ],
    tokens: [xdaiGIV],
    chain: "xdai",
  });
  return balance;
}

module.exports = {
  methodology: "Counts GIV staked in all farms",
  ethereum: {
    tvl: () => ({}),
    staking: mainnetStaking,
    pool2: mainnetPools,
  },
  xdai: {
    tvl: () => ({}),
    staking: stakingXDAI,
    pool2: poolXDAI,
  },
};
