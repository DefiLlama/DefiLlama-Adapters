const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = require('./abi.json');
const BigNumber = require("bignumber.js");
const { sumTokens } = require("../helper/unwrapLPs");

const tokens = {
    aUSDC: "0xbcca60bb61934080951369a648fb03df4f96263c",
    DAI: ADDRESSES.ethereum.DAI,
    cDAI: "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643",
    Gfuse: "0x495d133B938596C9984d462F007B676bDc57eCEC", // GoodDollar on Fuse
    FUSE: "0x970b9bb2c0444f5e81e9d0efb84c8ccdcdcaf84d", // Fuse on Mainnet
};

const FUSE_STAKING = '0xA199F0C353E25AdF022378B0c208D600f39a6505';
const GOV_STAKING = '0xFAF457Fb4A978Be059506F6CD41f9B30fCa753b0';
const GOV_STAKING_V2 = '0xB7C3e738224625289C573c54d402E9Be46205546';
const RESERVE_ADDRESS = '0xa150a825d425B36329D8294eeF8bD0fE68f8F6E0';
const AAVE_STAKING_V2 = '0x3ff2d8eb2573819a9ef7167d2ba6fd6d31b17f4f';
const COMPOUND_STAKING = '0xD33bA17C8A644C585089145e86E282fada6F3bfd';
const COMPOUND_STAKING_V2 = '0x7b7246c78e2f900d17646ff0cb2ec47d6ba10754';
const COMMUNITY_SAFE = '0x5Eb5f5fE13d1D5e6440DbD5913412299Bc5B5564';
const GOODDOLLAR_DECIMALS = 2;

async function eth(timestamp, ethBlock) {
    const balances = {};
    await sumTokens(balances, [
        [tokens.aUSDC, AAVE_STAKING_V2],
        [tokens.cDAI, COMPOUND_STAKING],
        [tokens.cDAI, COMPOUND_STAKING_V2],
        [tokens.cDAI, RESERVE_ADDRESS]
    ], ethBlock)

    return balances;
}

async function fuseStaking(timestamp, ethBlock, chainBlocks) {    
    const gdStaked = (await sdk.api.erc20.balanceOf({
        target: tokens.Gfuse,
        chain: 'fuse',
        owner: GOV_STAKING,
        block: chainBlocks['fuse'],
    })).output;

    const gdStakedV2 = (await sdk.api.erc20.balanceOf({
        target: tokens.Gfuse,
        chain: 'fuse',
        owner: GOV_STAKING_V2,
        block: chainBlocks['fuse'],
    })).output;

    const sumGdStaked = BigNumber(gdStaked).plus(gdStakedV2);
    const gdInDAI = await convertGoodDollarsToDai(sumGdStaked, ethBlock);

    const balances = {};
    sdk.util.sumSingleBalance(balances, tokens.DAI, Number(gdInDAI));

    return balances;
}

// Required until GoodDollar lists on CoinGecko
async function convertGoodDollarsToDai(gdAmount, ethBlock) {
    const gdPriceInDAI = (await sdk.api.abi.call({
        target: RESERVE_ADDRESS,
        abi: abi.currentPriceDAI,
        block: ethBlock
    })).output;

    return await new BigNumber(gdPriceInDAI).times(gdAmount).div(10 ** GOODDOLLAR_DECIMALS);
}

async function fuse(timestamp, ethBlock, chainBlocks) {
    const fuseAmount = (await sdk.api.abi.call({
        abi: abi.totalDelegated,
        chain: 'fuse',
        target: FUSE_STAKING,
        block: chainBlocks['fuse']
    })).output;

    const balances = {};
    sdk.util.sumSingleBalance(balances, tokens.FUSE, Number(fuseAmount));

    return balances;
}

module.exports = {
    methodology: `Aggregation of funds staked in our contracts on Ethereum and Fuse, funds locked in reserve backing G$ token and community treasury. G$ value was converted to USD based on current price at the reserve.`,
    misrepresentedTokens: true,
        ethereum: {
        tvl: eth
    },
    fuse: {
        staking: fuseStaking,
        tvl: () => ({}),
    },
}