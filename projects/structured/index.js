const { get } = require('../helper/http');

const nativeMaxBtcDenom = 'factory/neutron17sp75wng9vl2hu3sf4ky86d7smmk3wle9gkts2gmedn9x4ut3xcqa5xp34/maxbtc';
const neutronRest = 'https://rest.cosmos.directory/neutron/cosmos';

async function tvl(api) {
  const response = await get(`${neutronRest}/bank/v1beta1/supply/by_denom?denom=${encodeURIComponent(nativeMaxBtcDenom)}`);
  const amount = response?.amount;
  const rawAmount = amount?.amount;
  const parsedAmount = Number(rawAmount);

  if (typeof response !== 'object' || response === null || amount === undefined || !['string', 'number'].includes(typeof rawAmount) || !Number.isFinite(parsedAmount)) {
    throw new Error(`Unexpected Structured supply response for ${nativeMaxBtcDenom}: ${JSON.stringify(response)}`);
  }

  api.addCGToken('bitcoin', parsedAmount / 1e8);
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is calculated as the live native maxBTC supply issued by Structured on Neutron, priced as BTC. Wrapped bridge representations such as wmaxbtc are excluded to avoid double counting the same underlying product across chains.',
  neutron: {
    tvl,
  },
};
