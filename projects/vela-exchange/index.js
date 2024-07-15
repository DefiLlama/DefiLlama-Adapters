const sdk = require("@defillama/sdk");
const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking")
const { graphQuery } = require('../helper/http')

const VELA = '0x088cd8f5eF3652623c22D48b1605DCfE860Cd704'

const arbitrumEndpoint = sdk.graph.modifyEndpoint('8YXEzf1jmgVVt5d32fEo836bUzZKkCnYNcjAUXPEPhZQ')
const baseEndpoint = sdk.graph.modifyEndpoint('E2kcVHn6gD2nAs6Yf7a7REsYqBp8Pk3tnWhj8WvbVBhj')

async function velaStaking(api, endpoint) {
  const query = `
    query {
      poolInfos(where: {
        id: "all"
      }) {
        pid1
        pid2
        pid3
      }
    }
  `;
  const graphRes = (await graphQuery(endpoint, query)).poolInfos.find(x => true);
  api.add(VELA, graphRes?.pid2);
  api.add(VELA, graphRes?.pid3);
}

module.exports = {
  methodology: "Counts USDC deposited to trade and to mint VLP. Staking counts VELA and esVELA deposited to earn esVELA",
  arbitrum: {
    tvl: staking('0xC4ABADE3a15064F9E3596943c699032748b13352', [ADDRESSES.arbitrum.USDC_CIRCLE, ADDRESSES.arbitrum.USDC]),
    staking: async (api) => velaStaking(api,arbitrumEndpoint)
  },
  base: {
    start: 3566528,
    tvl: staking("0xC4ABADE3a15064F9E3596943c699032748b13352", ADDRESSES.base.USDbC),
    staking: async (api) => velaStaking(api,baseEndpoint)
  },
  hallmarks: [
    [Math.floor(new Date('2023-04-13') / 1e3), 'Refunded tokens to VLP holders & traders'],
    [1693926000, 'Launched on Base Chain']
  ],
}
