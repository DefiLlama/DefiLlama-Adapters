const { request } = require("graphql-request");

const subgraph =
  "https://api.thegraph.com/subgraphs/name/palmswap/synthetic-raw-mainnet";

async function fetchTotalStaked() {
  const graphQLTVL = `
          {
            stakedTotals {
              palmStakedTotal
              plpStakedTotal
            }
          }
        `;

  const res = await request(subgraph, graphQLTVL);
  const totalPALMStaked = res.stakedTotals[0]?.palmStakedTotal;

  return {
    PALM: totalPALMStaked,
  };
}

async function staked(_, _1, _2) {
  const { PALM } = await fetchTotalStaked();

  const palmFormatted = PALM / 1e18;
  return palmFormatted;
}

const { gmxExports } = require("../helper/gmx");
const { staking } = require("../helper/staking");

const palmswapVault = "0x806f709558CDBBa39699FBf323C8fDA4e364Ac7A"; //Vault

const palmTokenStakingContract = "0xF14fDA6c354b5Ec53027F131f2e8fBDD192A3095"; //RewardRouter
const palmToken = "0x29745314B4D294B7C77cDB411B8AAa95923aae38"; //PALM token address

module.exports = {
  bsc: {
    tvl: gmxExports({ vault: palmswapVault }), //works
    staking: staking(palmTokenStakingContract, palmToken), // does not work
  },
};
