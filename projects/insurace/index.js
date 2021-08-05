const sdk = require('@defillama/sdk');
const abi = require('./abi.json');
const _ = require('underscore');
const BigNumber = require('bignumber.js');
const axios = require("axios");
const { unwrapUniswapLPs } = require('../helper/unwrapLPs');


async function eth(timestamp, ethBlock) {
    // ETH
    // start timestamp: 1619248141
    // start ethBlock: 12301500
    // Stakers Pool creation time, Saturday, 24 April 2021 07:09:01 AM
    if (ethBlock < 12301500) {
        throw new Error("Not yet deployed")
    }
    const { data } = await axios.get("https://files.insurace.io/public/defipulse/pools.json");
    const pools = data.pools;

    const { output: _tvlList } = await sdk.api.abi.multiCall({
        calls: pools.map((pool) => ({
            target: pool.StakersPool,
            params: pool.PoolToken,
        })),
        abi: abi["getStakedAmountPT"],
        ethBlock,
    }
    );

    const balances = {};
    _.each(_tvlList, (element) => {
        let address = element.input.params[0].toLowerCase();
        if (address == "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
            address = "0x0000000000000000000000000000000000000000";
        }
        let balance = element.output;
        if (BigNumber(balance).toNumber() <= 0) {
            return;
        }
        balances[address] = BigNumber(balances[address] || 0).plus(balance).toFixed();
    })
    const uniLPINSUR2USDC = "0x169bf778a5eadab0209c0524ea5ce8e7a616e33b";
    /*
    await unwrapUniswapLPs(balances, [{
        token: uniLPINSUR2USDC,
        balance: balances[uniLPINSuniLPINSUR2USDCUR2USDC]
    }], ethBlock);
    */
    delete balances[uniLPINSUR2USDC];
    return balances;
}

async function bsc(timestamp, ethBlock, chainBlocks){
    // BSC
    // start bscBlock: 8312474
    // Stakers Pool creation time, Jun-15-2021 07:33:48 AM +UTC
    const bscBlock = chainBlocks["bsc"]
    if (bscBlock < 8312474) {
        throw new Error("Not yet deployed")
    }
    const { data } = await axios.get("https://files.insurace.io/public/defipulse/bscPools.json");
    const pools = data.pools;

    const { output: _tvlList } = await sdk.api.abi.multiCall({
        calls: pools.map((pool) => ({
            target: pool.StakersPool,
            params: pool.PoolToken,
        })),
        abi: abi["getStakedAmountPT"],
        bscBlock,
        chain: "bsc"
    }
    );

    const balances = {};
    _.each(_tvlList, (element) => {
        let address = element.input.params[0].toLowerCase();
        if (address == "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
            address = "bsc:0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c";
        }else if (address == "0x3192ccddf1cdce4ff055ebc80f3f0231b86a7e30") {
            address = "0x544c42fbb96b39b21df61cf322b5edc285ee7429";
        }else{
            address = `bsc:${address}`;
        }
        let balance = element.output;
        if (BigNumber(balance).toNumber() <= 0) {
            return;
        }
        balances[address] = BigNumber(balances[address] || 0).plus(balance).toFixed();
    })
    return balances;
}

module.exports = {
    ethereum: {
        tvl: eth,
    },
    bsc:{
        tvl: bsc
    },
    tvl: sdk.util.sumChainTvls([eth, bsc])
}