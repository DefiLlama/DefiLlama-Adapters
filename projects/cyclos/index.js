const { getTokenAccountBalance } = require("../helper/solana");

// The other pools are still under updgrading according to thier website!

const stakingPoolContracts = [
  {
    cys_nl: "HHvSez6nz1xC1d3E6sGEdXvn7bhsmQP5bGVf5Z7KRJXH",
    cys_2m: "GvWrRhTHYQC2QNG4Hph2bRL5KUqrRoUVmapvzPst96HH",
    token_nl: "cyclos",
    token_2m: "cyclos",
  },
];

const CYS = "BRLsMczKuaR5w9vSubF4j8HwEGGprVAyyVgS4EX7DKEg";

async function staking() {
  const pools = await Promise.all(
    stakingPoolContracts.map(async ({ cys_nl, cys_2m, token_nl, token_2m }) => {
          return [
            {
              coingeckoID: token_nl,
              amount: await getTokenAccountBalance(cys_nl),
            },
            {
              coingeckoID: token_2m,
              amount: await getTokenAccountBalance(cys_2m),
            },
          ];
    })
  );

  return pools.flat().reduce((acc, pool) => {
    return {
      ...acc,
      [pool.coingeckoID]: (acc[pool.coingeckoID] ?? 0) + pool.amount,
    };
  }, {});
}

module.exports = {
  timetravel: false,
  solana: {
    staking: staking,
    tvl: (tvl) => ({}),
  },
  methodology:
    'To obtain the Staking Part of Cyclos through on-chain calls using the function getTokenBalance() that uses the address of the token and the address of the contract where the tokens are found.',
};
