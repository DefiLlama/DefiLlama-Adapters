// This adapter is just to integrate Metrom in the DefiLlama yields dashboard.
// For more information on the product, check out https://www.metrom.xyz

async function tvl() {
  return {};
}

module.exports = {
  methodology:
    "Metrom can be used to reward concentrated liquidity positions in CLAMMs. See the yields dashboard for a list of Metrom incentivization campaigns.",
  base: { tvl },
  mantle: { tvl },
  mode: { tvl },
};
