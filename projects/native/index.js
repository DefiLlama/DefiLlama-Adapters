const sdk = require("@defillama/sdk");
const axios = require("axios");

async function tvl(_, _1, _2, { api }) {
  const balances = {};

  const pools = await axios.get(
    `http://chain-monitoring.native.org/analytics/pools?chain=${api.chain}`
  );

  const combinedTreasuryTokenAddresses = pools.data.reduce(
    (accumulator, item) => {
      const existingEntry = accumulator.find(
        (entry) => entry.treasury_address === item.treasury_address
      );

      if (existingEntry) {
        if (!existingEntry.token_addresses.includes(item.token0.address)) {
          existingEntry.token_addresses.push(item.token0.address);
        }
        if (!existingEntry.token_addresses.includes(item.token1.address)) {
          existingEntry.token_addresses.push(item.token1.address);
        }
      } else {
        accumulator.push({
          treasury_address: item.treasury_address,
          token_addresses: [item.token0.address, item.token1.address],
        });
      }

      return accumulator;
    },
    []
  );

  for (const entry of combinedTreasuryTokenAddresses) {
    const { treasury_address, token_addresses } = entry;

    for (const token_address of token_addresses) {
      const tokenBalance = await api.call({
        abi: "erc20:balanceOf",
        target: token_address,
        params: [treasury_address],
      });

      await sdk.util.sumSingleBalance(
        balances,
        token_address,
        tokenBalance,
        api.chain
      );
    }
  }

  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology:
    "includes the liquidity provided to the infrasturcture and ecosystem of Native",
  bsc: {
    tvl,
  },
  ethereum: {
    tvl,
  },
};
