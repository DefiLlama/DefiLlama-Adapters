const sdk = require('@defillama/sdk');
const { unwrapUniswapLPs, unwrapCrv, unwrapLPsAuto } = require('../helper/unwrapLPs')
const abi = require('./abi.json')
const { request, gql } = require("graphql-request");
const { transformAvaxAddress } = require('../helper/portedTokens');
const { default: BigNumber } = require('bignumber.js');
const { staking } = require('../helper/staking');
const { addFundsInMasterChef } = require('../helper/masterchef');
const { requery } = require('../helper/requery');

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

async function tvl(timestamp, ethBlock, chainBlocks) {
    const chain = 'avax'
    const block = chainBlocks.avax;
    const farms = (await request(graphUrl, graphQuery, { block })).farms
    const transformAddress = await transformAvaxAddress()
    const balances = {}
    farms.forEach(i => sdk.util.sumSingleBalance(balances, transformAddress(i.depositToken.id), i.depositTokenBalance))
    await unwrapLPsAuto({ balances, chain, block, blacklistedLPs: ['0xca87bf3ec55372d9540437d7a86a7750b42c02f4']})
    return balances
}

const masterYak = "0x0cf605484A512d3F3435fed77AB5ddC0525Daf5f"
const yakToken = "0x59414b3089ce2af0010e7523dea7e2b35d776ec7"
async function pool2(time, ethBlock, chainBlocks) {
    const balances = {}
    await addFundsInMasterChef(balances, masterYak, chainBlocks.avax, "avax", addr => `avax:${addr}`, undefined, [yakToken])
    return balances
}

module.exports = {
    avax:{
        tvl,
        staking: staking(masterYak, yakToken, "avax"),
        pool2
    }
}