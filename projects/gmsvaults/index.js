const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking");

const abi = 'uint256:totalUSDvaults';

const base_vault = "0xe1515D3A8c503a0fc68015844a9fc742D1c80927";
const base_staking = "0x3D893CC2C70242907cAac245D04C565056174EF7";
const base_GMS = "0x13dE6E0290C19893949650fe6fdf9CDfFAFa6040";

const calculateTvl = async (vaults, chain, block) => {
  const balances = {};
  const bals = await sdk.api2.abi.multiCall({
    abi,
    calls: vaults,
    chain,
    block,
  });

  bals.forEach((i) =>
    sdk.util.sumSingleBalance(balances, 'tether', i / 1e18, 'coingecko')
  );

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  methodology: 'staked gms + vault balance',
  base: {
    staking: staking(base_staking, [base_GMS]),
    tvl: async (ts, _, { base: block }) =>
      calculateTvl(
        [base_vault],
        'base',
        block
      ),
  },
};