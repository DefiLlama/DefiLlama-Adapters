const sdk = require('@defillama/sdk');
const { unwrapUniswapLPs, unwrapCrv } = require('../helper/unwrapLPs')
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
    const block = chainBlocks.avax;
    const farms = (await request(graphUrl, graphQuery, { block })).farms
    const transformAddress = await transformAvaxAddress()
    const calls = {
        calls: farms.map(f => ({
            target: f.id
        })),
        block,
        chain: 'avax'
    }
    const [tokenAmounts, tokens] = await Promise.all([
        sdk.api.abi.multiCall({
            ...calls,
            abi: abi.totalDeposits,
        }),
        sdk.api.abi.multiCall({
            ...calls,
            abi: abi.depositToken,
        })
    ])
    await requery(tokenAmounts, "avax", block, abi.totalDeposits)
    await requery(tokens, "avax", block, abi.depositToken)
    tokens.output.forEach((token, idx) => {
        if (token.output === null) {
            token.output = farms[idx].depositToken.id
        }
    })
    const balances = {}
    const lps = []
    const crvLps = []
    await Promise.all(farms.map(async (farm, idx)=>{
        let token = tokens.output[idx].output.toLowerCase()
        if (token == "0x0000000000000000000000000000000000000000") {
            token = "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7"; // Replace YY's AVAX with WAVAX
        }
        let balance = tokenAmounts.output[idx].output
        if (farm.name.startsWith("Snowball: sPGL ")) {
            const [underlyingToken, ratio] = await Promise.all([abi.token, abi.getRatio].map(abi =>
                sdk.api.abi.call({
                    target: token,
                    block,
                    chain: 'avax',
                    abi
                })
            ));
            token = underlyingToken.output;
            balance = BigNumber(balance).times(ratio.output).div(1e18).toFixed(0)
        } else if (farm.name.startsWith("Yield Yak: Gondola ") || farm.name.includes("Curve 3pool")) {
            crvLps.push({
                token,
                balance,
            })
        } else if(farm.name.includes("ZERO")){
            sdk.util.sumSingleBalance(balances, transformAddress(token), balance)
        } else if (farm.name.includes('-')) {
            lps.push({
                token,
                balance,
            })
        } else {
            sdk.util.sumSingleBalance(balances, transformAddress(token), balance)
        }
    }))

    await unwrapUniswapLPs(balances, lps, block, 'avax', transformAddress, [], true)
    await Promise.all(
        crvLps.map(crvLp => unwrapCrv(balances, crvLp.token, crvLp.balance, block, 'avax', transformAddress))
    )
    //await addTokensAndLPs(balances, tokens, tokenAmounts, block, 'avax', transformAddress)
    return balances
}

const masterYak = "0x0cf605484A512d3F3435fed77AB5ddC0525Daf5f"
const yakToken = "0x59414b3089ce2af0010e7523dea7e2b35d776ec7"
async function pool2(time, ethBlock, chainBlocks){
    const balances = {}
    await addFundsInMasterChef(balances, masterYak, chainBlocks.avax, "avax", addr=>`avax:${addr}`, undefined, [yakToken])
    return balances
}

module.exports = {
    avalanche:{
        tvl,
        staking: staking(masterYak, yakToken, "avax"),
        pool2
    }
}