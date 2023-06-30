const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking")
const { gql, request } = require('graphql-request');
const retry = require('async-retry')
const axios = require("axios");
const { ethers } = require('ethers');

const endpoint = "https://api.thegraph.com/subgraphs/name/velaexchange/vela-exchange-official"
  async function fetch() {
    let staking;

      const graphQuery = gql`
      query {
        poolInfos(where: {
          id: "all"
        }) {
          pid2
          pid3
        }
      }
      `;
      let price_feed = await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=vela-token&vs_currencies=usd'))
      const graphRes = (await request(endpoint, graphQuery)).poolInfos.find(x => true);
      const pid2 = parseInt(ethers.utils.formatEther(graphRes?.pid2)) * price_feed.data['vela-token'].usd
      const pid3 = parseInt((ethers.utils.formatEther(graphRes?.pid3))) * price_feed.data['vela-token'].usd
      staking = parseInt(pid2 + pid3)
      return {
        'arbitrum': staking
      }
;
}


module.exports = {
  methodology: "Counts USDC deposited to trade and to mint VLP. Staking counts VELA and esVELA deposited to earn esVELA",
  arbitrum: {
    tvl: staking('0xC4ABADE3a15064F9E3596943c699032748b13352', ADDRESSES.arbitrum.USDC),
    staking: fetch
   },
  hallmarks: [
    [Math.floor(new Date('2023-04-13')/1e3), 'Refunded tokens to VLP holders & traders'],
  ],
}