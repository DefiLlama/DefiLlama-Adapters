const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = {
    "currentPriceDAI": "uint256:currentPriceDAI",
    "totalDelegated": "uint256:totalDelegated"
};
const BigNumber = require("bignumber.js");

const tokens = {
    aUSDC: "0xbcca60bb61934080951369a648fb03df4f96263c",
    DAI: ADDRESSES.ethereum.DAI,
    cDAI: "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643",
    Gfuse: "0x495d133B938596C9984d462F007B676bDc57eCEC", // GoodDollar on Fuse
    FUSE: "0x970b9bb2c0444f5e81e9d0efb84c8ccdcdcaf84d", // Fuse on Mainnet
};

const FUSE_STAKING = '0xA199F0C353E25AdF022378B0c208D600f39a6505';
const RESERVE_ADDRESS = '0xa150a825d425B36329D8294eeF8bD0fE68f8F6E0';
const COMMUNITY_SAFE = '0x5Eb5f5fE13d1D5e6440DbD5913412299Bc5B5564';
const GOODDOLLAR_DECIMALS = 2;

async function fuseTreasury(timestamp, ethBlock, chainBlocks) {
    const gdInCommunitySafe = (await sdk.api.erc20.balanceOf({
        target: tokens.Gfuse,
        chain: 'fuse',
        owner: COMMUNITY_SAFE,
        block: chainBlocks['fuse']
    })).output;

    const gdInFuseStaking = (await sdk.api.erc20.balanceOf({
        target: tokens.Gfuse,
        chain: 'fuse',
        owner: FUSE_STAKING,
        block: chainBlocks['fuse']
    })).output;

    const gdTotal = BigNumber(gdInCommunitySafe).plus(gdInFuseStaking);

    let gdInDAI = await convertGoodDollarsToDai(gdTotal, ethBlock);

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

module.exports = {
    fuse: {
        tvl: () => 0,
        ownTokens: fuseTreasury
    },
}