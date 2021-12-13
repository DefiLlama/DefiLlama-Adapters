const sdk = require('@defillama/sdk');
const { default: BigNumber } = require('bignumber.js');

const contracts = {
    "treasury": "0x283C41b726634fBD6B72aA22741B202DB7E56aaC",
    "treasuryV2": "0x1058AFe66BB5b79C295CCCE51016586949Bc4e8d",
    "trading1": "0x9BC357bc5b312AaCD41a84F3C687F031B8786853",
    "trading2": "0xA55Eee92a46A50A4C65908F28A0BE966D3e71633",
    "trading3": "0xCAEc650502F15c1a6bFf1C2288fC8F819776B2eC",
    "staking": "0xC8CDd2Ea6A5149ced1F2d225D16a775ee081C67D",
    "ethPool": "0xE0cCd451BB57851c1B2172c07d8b4A7c6952a54e",

    "usdcPool": "0x958cc92297e6F087f41A86125BA8E121F0FbEcF2",
};
const cap = "0x031d35296154279dc1984dcd93e392b1f946737b";
const weth = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const usdc = "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8";

async function tvl(_time, _ethBlock, chainBlocks) {
    let balances = {};

    balances[`arbitrum:${usdc}`] = (await sdk.api.erc20.balanceOf({
        target: usdc,
        owner: contracts.usdcPool,
        chain: 'arbitrum',
        block: chainBlocks.arbitrum
    })).output;

    const ethLocked = await sdk.api.eth.getBalances({
        targets: [
            contracts.trading1,
            contracts.trading2,
            contracts.trading3,
            contracts.ethPool
        ],
        chain: 'arbitrum',
        block: chainBlocks.arbitrum
    });

    balances[weth] = ethLocked.output.reduce((total, item) =>
        BigNumber(item.balance).plus(total), 0).toFixed(0);

    return balances;
};

async function treasury(_time, _ethBlock, chainBlocks) {
    let balances = {};
    balances[`arbitrum:${usdc}`] = (await sdk.api.erc20.balanceOf({
        target: usdc,
        owner: contracts.treasury,
        chain: 'arbitrum',
        block: chainBlocks.arbitrum
    })).output;

    const ethLocked = await sdk.api.eth.getBalances({
        targets: [contracts.treasury, contracts.treasuryV2],
        chain: 'arbitrum',
        block: chainBlocks.arbitrum
    });

    balances[weth] = ethLocked.output.reduce((total, item) =>
        BigNumber(item.balance).plus(total), 0).toFixed(0);
    return balances;
};

async function staking(_time, _ethBlock, chainBlocks) {
    const capLocked = (await sdk.api.erc20.balanceOf({
        target: cap,
        owner: contracts.staking,
        chain: 'arbitrum',
        block: chainBlocks.arbitrum
    }));

    return { [`arbitrum:${cap}`]: capLocked.output }
}

module.exports = {
    methodology: "ETH locked on trading contracts",
    arbitrum: {
        treasury,
        staking,
        tvl
    }
};