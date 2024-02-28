const { nullAddress } = require('../helper/tokenMapping');
const { get } = require('../helper/http')
const sdk = require("@defillama/sdk");


async function bsctvl(timestamp, block, chainBlocks, { api }) {
  const bal = await api.call({ abi: 'function exchangeRate() external view returns (uint256 totalWei, uint256  poolTokenSupply)', target: '0xc228cefdf841defdbd5b3a18dfd414cc0dbfa0d8' })

  return {
    ['bsc:' + nullAddress]: bal.totalWei
  };
}

const baseEndpoint = 'https://api.persistence.one/pstake'

const chainInfos = {
  cosmos: {
    id: "cosmoshub-4",
    name: "cosmos",
    denom: "uatom",
    decimals: 1e6,
    endpoint: "/stkatom/atom_tvu"
  },
  osmosis: {
    id: "osmosis-1",
    name: "osmosis",
    denom: "uosmo",
    decimals: 1e6,
    endpoint: "/stkosmo/osmo_tvu"
  },
  dydx: {
    id: "dydx-mainnet-1",
    name: "dydx-chain",
    denom: "adydx",
    decimals: 1e18,
    endpoint: "/stkdydx/dydx_tvu"
  }
}

function cosmostvl(chainInfo) {
  return async () => {
    const api = baseEndpoint + chainInfo.endpoint

    const amount = await get(api)

    const result = {};
    sdk.util.sumSingleBalance(result, chainInfo.name, amount.amount.amount / chainInfo.decimals);

    return result
  }
}

module.exports = {
  methodology: `Total amount of liquid staked tokens on pStake.`,
  bsc: { tvl: bsctvl },
  persistence: { tvl: async () => ({}) },
  cosmos: {tvl: cosmostvl(chainInfos["cosmos"])},
  osmosis: {tvl: cosmostvl(chainInfos["osmosis"])},
  dydx: {tvl: cosmostvl(chainInfos["dydx"])},
};
