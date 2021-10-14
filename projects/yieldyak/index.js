const sdk = require('@defillama/sdk');
const { unwrapUniswapLPs, unwrapCrv } = require('../helper/unwrapLPs')
const abi = require('./abi.json')
const { request, gql } = require("graphql-request");
const { transformAvaxAddress, fixAvaxBalances } = require('../helper/portedTokens');
const { default: BigNumber } = require('bignumber.js');

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
    tokens.output.forEach((token, idx) => {
        if (token.output === null) {
            token.output = farms[idx].depositToken.id
        }
    })
    const balances = {}
    const lps = []
    const crvLps = []
    await Promise.all(farms.map(async (farm, idx)=>{
        let token = tokens.output[idx].output
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
        } else if (farm.name.startsWith("Yield Yak: Gondola ")) {
            crvLps.push({
                token,
                balance,
            })
        } else if (farm.name.includes('-')) {
            lps.push({
                token,
                balance,
            })
        } else {
            sdk.util.sumSingleBalance(balances, transformAddress(token), balance)
        }
    }))

    await unwrapUniswapLPs(balances, lps, block, 'avax', transformAddress)
    await Promise.all(
        crvLps.map(crvLp => unwrapCrv(balances, crvLp.token, crvLp.balance, block, 'avax', transformAddress))
    )
    //await addTokensAndLPs(balances, tokens, tokenAmounts, block, 'avax', transformAddress)
    fixAvaxBalances(balances)
    return balances
}

module.exports = {
    tvl
}