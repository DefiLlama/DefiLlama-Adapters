const { sumTokensAndLPsSharedOwners, 
    unwrapUniswapLPs } = require('../helper/unwrapLPs');
const { getBlock } = require('../helper/getBlock');
const { transformAvaxAddress } = require('../helper/portedTokens');
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const contracts = require('./contracts');

const ethTokens = contracts.eth.tokens;
const ethFundedContracts = Object.keys(contracts.eth.funded);
const ethStakingContracts = Object.keys(contracts.eth.staking);
const ethOtTokens = Object.keys(contracts.eth.otTokens);
const ethPool2Contracts = Object.keys(contracts.eth.pool2);

const avaxTokens = contracts.avax.tokens;
const avaxFundedContracts = Object.keys(contracts.avax.funded);
const avaxOtTokens = Object.keys(contracts.avax.otTokens);
const avaxPool2Contracts = Object.keys(contracts.avax.pool2);

async function ethTvl(timestamp, block) {
    const balances = {};
    let lpBalances = [];
    const masterChefContract = "0xc2edad668740f1aa35e4d8f227fb8e17dca888cd";

    const masterChefDeposits = await sdk.api.abi.call({
        target: masterChefContract,
        abi: abi,
        params: [1, ethFundedContracts[4]],
        block: block,
      });
    lpBalances.push({
        'token': ethTokens.SLP_ETHUSDC,
        'balance': masterChefDeposits.output.amount
    });
    await unwrapUniswapLPs(balances, lpBalances, block);
    
    await sumTokensAndLPsSharedOwners(balances, [
        [ethTokens.USDC, false],
        [ethTokens.aUSDC, false],
        [ethTokens.cDAI, false],
        [ethTokens.SLP_ETHUSDC, true],
        [ethTokens.SLP_PENDLEETH, true],
        [ethTokens.SUSHI, false],
        [ethTokens.COMP, false],
        [ethTokens.SLP_OT_aUSDC_21, true],
        [ethTokens.SLP_OT_aUSDC_22, true],
        [ethTokens.SLP_OT_cDAI_21, true], 
        [ethTokens.SLP_OT_cDAI_22, true],
        [ethTokens.SLP_OT_ETHUSDC_22, true],
    ], ethFundedContracts, block);
    for (token of ethOtTokens) {
        delete balances[token.toLowerCase()];
    };
    delete balances[ethTokens.PENDLE];
    return balances;
};
async function staking(timestamp, block) {
    const staking = {};
    await sumTokensAndLPsSharedOwners(staking, [
        [ethTokens.PENDLE, false],
    ], ethStakingContracts, block);
    return staking;
};
async function ethPool2(timestamp, block) {
    const pool2 = {};
    await sumTokensAndLPsSharedOwners(pool2, [
        [ethTokens.SLP_PENDLEETH, true],
        [ethTokens.PENDLE, false],
        [ethTokens.SUSHI, false]
    ], ethPool2Contracts, block);

    return pool2;
};
async function avaxTvl(timestamp, block, chainBlocks) {
    const transform = await transformAvaxAddress();
    const balances = {};
    block = await getBlock(timestamp, "avax", chainBlocks);
    const masterChefContract = "0xd6a4F121CA35509aF06A0Be99093d08462f53052";

    balances[transform(avaxTokens.xJOE)] = (await sdk.api.abi.call({
        target: masterChefContract,
        abi: abi,
        params: [24, avaxFundedContracts[0]],
        block: block,
        chain: "avax"
      })).output.amount;

    await sumTokensAndLPsSharedOwners(balances, [
        [avaxTokens.USDC, false],
        [avaxTokens.qiAVAX, false],
        [avaxTokens.qiUSDC, false],
        [avaxTokens.xJOE, false],
        [avaxTokens.JLP_PENDLEAVAX, true],
        [avaxTokens.WAVAX, false],
        [avaxTokens.JOE, false],
        [avaxTokens.QI, false],
        [avaxTokens.JLP_OT_PAP, true],
        [avaxTokens.JLP_OT_qiUSDC, true],
        [avaxTokens.JLP_OT_qiAVAX, true],
        [avaxTokens.JLP_OT_xJOE, true],
    ], avaxFundedContracts, block, "avax", transform);

    for (token of avaxOtTokens) {
        delete balances[`avax:${token.toLowerCase()}`];
    };

    if (`avax:${avaxTokens.qiUSDC}` in balances) {
        balances[ethTokens.USDC] = Number(balances[ethTokens.USDC]) 
            + Number(balances[`avax:${avaxTokens.qiUSDC}`]) / 10**12
        delete balances[`avax:${avaxTokens.qiUSDC}`]
    };
    delete balances[avaxTokens.PENDLE];
    return balances;
};
async function avaxPool2(timestamp, block, chainBlocks) {
    const transform = await transformAvaxAddress();
    const pool2 = {};
    block = await getBlock(timestamp, "avax", chainBlocks);

    await sumTokensAndLPsSharedOwners(pool2, [
        [avaxTokens.JLP_PENDLEAVAX, true],
        [avaxTokens.PENDLE, false],
        [avaxTokens.JOE, false]
    ], avaxPool2Contracts, block, "avax", transform);

    return pool2;
};

module.exports = {
    ethereum:{
        pool2: ethPool2,
        tvl: ethTvl,
        staking
    },
    avalanche:{
        pool2: avaxPool2,
        tvl: avaxTvl
    },
    methodology: "Counts the collateral backing the yield tokens and USDC in the pendle markets, plus staked OT liquidity, and SLP/JLP staked in masterchef. Staking TVL is just staked PENDLE on 0x07282F2CEEbD7a65451Fcd268b364300D9e6D7f5. Pool2 refers to the Pe,P pool on mainnet, and Pa,P pool on avax.",
};
// node test.js projects/pendle/index.js