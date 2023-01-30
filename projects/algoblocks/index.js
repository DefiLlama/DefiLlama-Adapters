const sdk = require("@defillama/sdk");

const ALGOBLOCKS_TOKEN_CONTRACT = "0xfecCa80fF6DeB2B492E93df3B67f0C523Cfd3a48";
const ALGOBLOCKS_STAKING_POOL = "0xaC87dE420894eAA8234d288334FAec08bB46ffe7";

async function tvl(_, _1, _2, { api }) {
  const balances = {};

  const algblkStakingPoolsBalance = await api.call({
    abi: "erc20:balanceOf",
    target: ALGOBLOCKS_TOKEN_CONTRACT,
    params: [ALGOBLOCKS_STAKING_POOL],
  });

  await sdk.util.sumSingleBalance(
    balances,
    ALGOBLOCKS_TOKEN_CONTRACT,
    algblkStakingPoolsBalance,
    api.chain
  );

  return balances;
}

module.exports = {
  methodology: "",
  bsc: {
    tvl,
  },
};
