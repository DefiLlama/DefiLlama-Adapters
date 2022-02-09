const sdk = require("@defillama/sdk");
const BigNumber = require('bignumber.js')
const { transformIotexAddress } = require('../helper/portedTokens.js')
const getEntireSystemCollAbi = require("./getEntireSystemColl.abi.json")
const _ = require('underscore');

const iotexTMs = {
    "0x366D48c04B0d315acF27Bd358558e92D4e2E9f3D": "0xa00744882684c3e4747faefd68d283ea44099d03", // WIOTX
}

const iotexStableAPs = {
    "0x8Af0EE5A98609fEdaf301Af74d3ca4Da614eaD43": "0x84abcb2832be606341a50128aeb1db43aa017449", // BUSD_b
    "0xF524F844216069b167d65DCe68B24F3358260BD5": "0x6fbcdc1169b5130c59e72e51ed68a84841c98cd1", // USDT
    "0x206aAF608d1DD7eA9Db4b8460B2Bf8647522f90a": "0xd6070ae98b8069de6b494332d1a1a81b6179d960" // any
}
// node test.js projects/xdollar-finance/index.js

const iotexTvl = async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};
    const calls = [];
    const transform = await transformIotexAddress()
    for (const troveManager in iotexTMs) {
        calls.push({
            target: troveManager
        })
    }

    let getCollResults = await sdk.api.abi.multiCall({
        block: chainBlocks.iotex,
        calls: calls,
        abi: getEntireSystemCollAbi,
        chain: 'iotex'
    });

    _.each(getCollResults.output, (getColl) => {
        let address = iotexTMs[getColl.input.target]
        let amount =  getColl.output

        address  = transform(address);

        if (address == 'iotex') {
            amount = parseInt(amount / 1e18)
        }
  
        balances[address] = BigNumber(balances[address]|| 0).plus(amount).toFixed()
    });

    const balanceOfCalls = []
    for (const activePool in iotexStableAPs) {
        balanceOfCalls.push({
            target: iotexStableAPs[activePool],
            params: activePool
        })
    }

    let balanceOfResults = await sdk.api.abi.multiCall({
        block: chainBlocks.iotex,
        calls: balanceOfCalls,
        abi: 'erc20:balanceOf',
        chain: 'iotex'
    });

    _.each(balanceOfResults.output, (balanceOf) => {
        let address = balanceOf.input.target
        let amount =  balanceOf.output

        address  = transform(address);

        balances[address] = BigNumber(balances[address]|| 0).plus(amount).toFixed()
    });

    return balances;
};


module.exports = {
    iotex: {
        tvl: iotexTvl,
    },
    
};
