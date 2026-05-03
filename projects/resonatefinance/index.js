const { get } = require('../helper/http');


async function tvl(api) {
  if ((api.timestamp ?? Date.now() / 1000) * 1000 > new Date('2025-08-01')) return {}

  api.addUSDValue(await get(`https://api.resonate.finance/${api.chainId}/tvl`));
}

module.exports = {
    deadFrom: '2025-08-01',
    methodology: "We sum all the tokens deposited as principal and any unclaimed interest accrued on it.",
    hallmarks: [
      ['2023-04-25', "Launch of Regen Portal"],
      ['2023-06-20', "Launch of Frax Portal"]
    ],
    ethereum: {
      tvl
    },
    polygon: {
        tvl
    },
    optimism: {
      tvl
    },
    arbitrum: {
      tvl
    },
    fantom: {
      tvl
    },
  };
