const sdk = require('@defillama/sdk');
const { request, gql } = require("graphql-request");
const { staking } = require('../helper/staking');

const graphUrl = 'https://api.thegraph.com/subgraphs/name/yieldyak/reinvest-tracker'
const graphQuery = gql`
query get_tvl($block: Int) {
    farms(first: 1000) {
        id
        name
        depositToken {
          id
        }
        depositTokenBalance
    }
}
`;

async function tvl(timestamp, ethBlock, chainBlocks, { api }) {
    const block = chainBlocks.avax;
    const farms = (await request(graphUrl, graphQuery, { block })).farms
    const balances = {}
    farms.forEach(i => sdk.util.sumSingleBalance(balances, i.depositToken.id, i.depositTokenBalance, 'avax'))
    delete balances['avax:0x59414b3089ce2af0010e7523dea7e2b35d776ec7']

    // TODO: remove this code, it is no longer necessary
    const stakedGLP = 'avax:0x5643f4b25e36478ee1e90418d5343cb6591bcb9d'
    if (balances[stakedGLP]) {
        balances['avax:0x01234181085565ed162a948b6a5e88758cd7c7b8'] = balances[stakedGLP]
        delete balances[stakedGLP]
    }
    return balances
}

const masterYak = "0x0cf605484A512d3F3435fed77AB5ddC0525Daf5f"
const yakToken = "0x59414b3089ce2af0010e7523dea7e2b35d776ec7"

module.exports = {
    avax:{
        tvl,
        staking: staking(masterYak, yakToken),
    }
}