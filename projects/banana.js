const retry = require('./helper/retry')
const axios = require("axios");
const sdk = require('@defillama/sdk');
const getReserves = require('./helper/abis/getReserves.json');
const { getTokenPriceCoinGecko } = require('./config/bella/utilities.js');
const { unwrapUniswapLPs } = require("./helper/unwrapLPs");
const contracts = {
    lp: '0x59b901160bb8eeec517ed396ab68e0da81707c12',
    bana: '0xc67b9b1b0557aeafa10aa1ffa1d7c87087a6149e',
    staking: '0x3c8878107e029d25ed6fd504072c98d1fb7f6f3b',
    pool2: '0xe6c1405521d430113aad94a84a7080a1843b9526'
};
async function tvl(timestamp, block, chainBlocks){
    let data = (await retry(async bail => 
        await axios.get('https://bananafarm.io/api/boba/tvl/total')));
    console.log((await pool2(timestamp, block, chainBlocks))['usd-coin'])
    const tvl = data.data.tvl -     
        (await staking(timestamp, block, chainBlocks))['usd-coin'] - 
        (await pool2(timestamp, block, chainBlocks))['usd-coin']
    return { 'usd-coin': tvl }
}; 
async function bananaUsd(block) {
    const reserves = (await sdk.api.abi.call({
        target: contracts.lp,
        abi: getReserves,
        chain: 'boba',
        block: block
    })).output;

    const ethPrice = await getTokenPriceCoinGecko("usd")("ethereum");
    return reserves[1] / reserves[0] * ethPrice;
};
async function staking(timestamp, block, chainBlocks) {
    const staked = (await sdk.api.abi.call({
        target: contracts.bana,
        params: contracts.staking,
        abi: "erc20:balanceOf",
        chain: 'boba',
        block: chainBlocks['boba']
    })).output;
    const banaPrice = await bananaUsd(chainBlocks['boba']);
    return { 'usd-coin': staked * banaPrice / 10 ** 18 };
};
async function pool2(timestamp, block, chainBlocks) {
    const balances = {};
    const staked = (await sdk.api.abi.call({
        target: contracts.lp,
        params: contracts.pool2,
        abi: "erc20:balanceOf",
        chain: 'boba',
        block: chainBlocks['boba']
    })).output;

    await unwrapUniswapLPs(
        balances, 
        [{ balance: 2 * staked, token: contracts.lp }],
        chainBlocks['boba'],
        'boba'
        );
    const banaPrice = await bananaUsd(chainBlocks['boba']);
    console.log(balances[contracts.bana] * banaPrice / 10 ** 18)
    console.log(balances['0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000'] * 3808 / 10 ** 18)
    return { 'usd-coin': balances[contracts.bana] * banaPrice / 10 ** 18 };
};
module.exports = {
    misrepresentedTokens: true,
    boba: {
        tvl,
        staking,
        pool2
    }
};