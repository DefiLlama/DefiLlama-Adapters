const { nullAddress } = require('../helper/tokenMapping');
const { get } = require('../helper/http')
const sdk = require("@defillama/sdk");


async function bsctvl(api) {
  const bal = await api.call({ abi: 'function exchangeRate() external view returns (uint256 totalWei, uint256  poolTokenSupply)', target: '0xc228cefdf841defdbd5b3a18dfd414cc0dbfa0d8' })

  return {
    ['bsc:' + nullAddress]: bal.totalWei
  };
}

const baseEndpoint = 'https://api.persistence.one/pstake'

const chainInfos = {
  cosmos: {
    name: "cosmos",
    decimals: 1e6,
    endpoint: "/stkatom/atom_tvu"
  },
  osmosis: {
    name: "osmosis",
    decimals: 1e6,
    endpoint: "/stkosmo/osmo_tvu"
  },
  dydx: {
    name: "dydx-chain",
    decimals: 1e18,
    endpoint: "/stkdydx/dydx_tvu"
  },
  stargaze: {
    name: "stargaze",
    decimals: 1e6,
    endpoint: "/stkstars/stars_tvu"
  }
}

function cosmostvl() {
  return async () => {

    let tvl = {}
    for (const chain of Object.values(chainInfos)) {
      const api = baseEndpoint + chain.endpoint

      const amount = await get(api)

      const balance = {};
      sdk.util.sumSingleBalance(balance, chain.name, amount.amount.amount / chain.decimals);

      tvl[chain.name] = balance[chain.name]
    }

    return tvl
  }
}

module.exports = {
  methodology: `Total amount of liquid staked tokens on Persistence.`,
  bsc: { tvl: bsctvl },
  persistence: { tvl: cosmostvl() },
};
