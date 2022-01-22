const sdk = require("@defillama/sdk");
const abi = require('./abi.json');
const retry = require("async-retry");
const axios = require("axios");
const usdc = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
const prxy = '0xab3d689c22a2bb821f50a4ff0f21a7980dcb8591';

async function getPrograms() {
    const programList = await retry(async bail => await axios.get(
        'https://api.btcpx.io/api/v1/prxy-staking/list/0/10', 
        { headers: {
                'x-signature': 'f104e31bbc788b25c12ad65f4063bea9c9a731004212002f3f7c773f9d72f7a1',
                'origin': 'https://app.prxy.fi'
        }}));
    return programList.data.txs;
};

async function tvl(block, chain) {
    let balances = {};

    if (chain == 'polygon') {
        balances[`polygon:${prxy}`] = (
            await sdk.api.erc20.balanceOf({
            target: prxy,
            owner: '0x015CEe3aB6d03267B1B2c05D2Ac9e2250AF5268d',
            block,
            chain
            })).output;
    };

    const programs = await getPrograms()
    for (const program of programs) {
        if (program.chain.toLowerCase() == chain) {
            const staked = (await sdk.api.abi.call({
                target: program.stakingContractAddress,
                abi,
                block,
                chain
            })).output;
            sdk.util.sumSingleBalance(balances, usdc, staked);
        };
    };
    return balances;
};

async function ethereum(timestamp, block) {
    return await tvl(block, 'ethereum')
};

async function polygon(timestamp, block, chainBlocks) {
    return await tvl(chainBlocks.polygon, 'polygon')
};

module.exports = {
    misrepresentedTokens: true,
    polygon: {
        tvl: polygon
    },
    ethereum: {
        tvl: ethereum
    },
    methodology: `BTC Proxy offers a unique institutional-grade wrapped Bitcoin solution that leverages Polygon technology to bring Bitcoin to DeFi 2.0 with no gas and no slippage and insured custody. BTC Proxy features (3,3) Staking and Bonding via the PRXY Governance token`
};