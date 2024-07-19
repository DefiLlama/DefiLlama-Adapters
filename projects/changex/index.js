const { staking } = require("../helper/staking");
const { get } = require("../helper/http");
const CHANGEX_TOKEN_CONTRACT_ETH = "0x7051faed0775f664a0286af4f75ef5ed74e02754";
const CHANGEX_TOKEN_STAKING_CONTRACT_ETH =
  "0x48309699c488ad207Dd9d228bBb013cF848a6e50";
const CHANGEX_TOKEN_CONTRACT_HYDRA = "bd3c617d271b3467bd9b83dda73c9288de2fb0c9";
const CHANGEX_TOKEN_STAKING_CONTRACT_HYDRA =
  "72c9a79baa83e698bf1dbf44d26e5bdca2d2bab1";

async function tvl(api) {
  const data = await get('https://explorer.hydrachain.org/7001/contract/'+CHANGEX_TOKEN_STAKING_CONTRACT_HYDRA)
  return {
    changex: data.qrc20Balances.find(i => i.addressHex === CHANGEX_TOKEN_CONTRACT_HYDRA)?.balance / 1e18
  }
}

module.exports = {
  timetravel: false,
  ethereum: {
    tvl: () => ({}),
    staking: staking(
      CHANGEX_TOKEN_STAKING_CONTRACT_ETH,
      CHANGEX_TOKEN_CONTRACT_ETH
    ),
  },
  hydra: {
    staking: tvl,
  },
};
