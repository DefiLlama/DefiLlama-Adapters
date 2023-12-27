const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking")
const { graphQuery } = require('../helper/http')

const VELA = '0x088cd8f5eF3652623c22D48b1605DCfE860Cd704'

const arbitrumEndpoint = "https://api.thegraph.com/subgraphs/name/velaexchange/vela-exchange-official"
const baseEndpoint = "https://api.thegraph.com/subgraphs/name/velaexchange/vela-exchange-official-base"
async function staking_arbitrum_() {
  const { api } = arguments[3]

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
  const graphRes = (await graphQuery(arbitrumEndpoint, query)).poolInfos.find(x => true);
  api.add(VELA, graphRes?.pid2)
  api.add(VELA, graphRes?.pid3)
}

async function staking_base_() {
  const { api } = arguments[3]

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
  const graphRes = (await graphQuery(baseEndpoint, query)).poolInfos.find(x => true);
  api.add(VELA, graphRes?.pid2)
  api.add(VELA, graphRes?.pid3)
}

module.exports = {
  methodology: "Counts USDC deposited to trade and to mint VLP. Staking counts VELA and esVELA deposited to earn esVELA",
  arbitrum: {
    tvl: staking('0xC4ABADE3a15064F9E3596943c699032748b13352', ADDRESSES.arbitrum.USDC),
    staking: staking_arbitrum_
  },
  base: {
    start: 3566528,
    tvl: staking("0xC4ABADE3a15064F9E3596943c699032748b13352", ADDRESSES.base.USDbC),
    staking: staking_base_
  },
  hallmarks: [
    [Math.floor(new Date('2023-04-13') / 1e3), 'Refunded tokens to VLP holders & traders'],
    [1693926000, 'Launched on Base Chain']
  ],
}
