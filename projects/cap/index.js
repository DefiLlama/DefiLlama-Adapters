const sdk = require('@defillama/sdk');
const { default: BigNumber } = require('bignumber.js');

const contracts = {
    "trading1": "0x9BC357bc5b312AaCD41a84F3C687F031B8786853",
    "trading2": "0xA55Eee92a46A50A4C65908F28A0BE966D3e71633",
    "trading3": "0xCAEc650502F15c1a6bFf1C2288fC8F819776B2eC",
    "staking": "0xC8CDd2Ea6A5149ced1F2d225D16a775ee081C67D",
    "ethPool": "0xB224F2689BC0aFc5b6721a0807d07017D8CDddf8",

    "usdcPool": "0x07B0B00B9008798055071dde6f2d343782b35dC6",
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

    balances[`arbitrum:${cap}`] = (await sdk.api.erc20.balanceOf({
        target: cap,
        owner: contracts.staking,
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
    const ethLocked = await sdk.api.eth.getBalance({
        target: "0x1058afe66bb5b79c295ccce51016586949bc4e8d",
        chain: 'arbitrum',
        block: chainBlocks.arbitrum
    });

    return { [weth]: ethLocked.output };
};


module.exports = {
    methodology: "ETH locked on trading contracts",
    arbitrum: {
        treasury,
        tvl
    }
};