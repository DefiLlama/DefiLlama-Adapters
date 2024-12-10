const { CentralStateV2, ACCESS_PROGRAM_ID } = require("@accessprotocol/js");
const { getConnection } = require("../helper/solana");

async function staking() {
  const connection = getConnection();
  const [centralKey] = CentralStateV2.getKey(ACCESS_PROGRAM_ID);
  const centralState = await CentralStateV2.retrieve(connection, centralKey);
  return {
    [`solana:${centralState.tokenMint.toString()}`]: Number(centralState.totalStaked.toString())
  }
}

module.exports = {
  timetravel: false,
  methodology:
    "Uses the Access Protocol SDK to fetch the total supply of staked ACS tokens",
  solana: {
    tvl: async () => ({}),
    staking,
  },
};
