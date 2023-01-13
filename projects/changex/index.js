const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking");
const CHANGEX_TOKEN_CONTRACT_ETH = "0x7051faed0775f664a0286af4f75ef5ed74e02754";
const CHANGEX_TOKEN_STAKING_CONTRACT_ETH =
  "0x48309699c488ad207Dd9d228bBb013cF848a6e50";
const CHANGEX_TOKEN_CONTRACT_HYDRA = "bd3c617d271b3467bd9b83dda73c9288de2fb0c9";
const CHANGEX_TOKEN_STAKING_CONTRACT_HYDRA =
  "72c9a79baa83e698bf1dbf44d26e5bdca2d2bab1";


async function tvl(_, _1, _2, { api }) {
  const balances = {};

  const totalBalance = await api.call({
    abi: "function totalBalance() view returns (uint256)",
    target: CHANGEX_TOKEN_CONTRACT_HYDRA,
    params: [CHANGEX_TOKEN_STAKING_CONTRACT_HYDRA],
  });

  await sdk.util.sumSingleBalance(
    balances,
    CHANGEX_TOKEN_CONTRACT_HYDRA,
    totalBalance,
    api.chain
  );

  return balances;
}

module.exports = {
  start: 1000235,
  ethereum: {
    tvl: () => ({}),
    staking: staking(
      CHANGEX_TOKEN_STAKING_CONTRACT_ETH,
      CHANGEX_TOKEN_CONTRACT_ETH
    ),
  },
  hydra: {
    tvl,
    // tvl: () => ({}),
    // staking: staking(
    //   CHANGEX_TOKEN_STAKING_CONTRACT_HYDRA,
    //   CHANGEX_TOKEN_CONTRACT_HYDRA,
    // ),
  },
};
