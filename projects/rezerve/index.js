const { staking } = require("../helper/staking");
const { sumTokens2 } = require("../helper/unwrapLPs");

const addresses = {
  rzr: '0xb4444468e444f89e1c2CAc2F1D3ee7e336cBD1f5',
  depositContract: "0xe22e10f8246dF1f0845eE3E9f2F0318bd60EFC85",
  stakingContract: "0xd060499DDC9cb7deB07f080BAeB1aDD36AA2C650",
  tokenList: "0xe8cb54f2523ABa0FBD2Bbd11f979BE75bDfd9917",
}

const tvl = async (api) => {
  const abi = 'function getTokens() external view returns (address[] memory)'
  const tokens = await api.call({ abi, target: addresses.tokenList });
  const toa = tokens.map(token => [token, addresses.depositContract])
  return api.sumTokens({ tokensAndOwners: toa })
}

const pool2 = async (api) => {
  const abi = 'function getLpTokens() external view returns (address[] memory)'
  const tokens = await api.call({ abi, target: addresses.tokenList });
  return sumTokens2({ api, tokens, owners: [addresses.depositContract], resolveLP: true })
}


const data = {
  sonic: {
    tvl,
    pool2,
    staking: staking(addresses.stakingContract, addresses.rzr, "sonic"),
  }
};

module.exports = data;
