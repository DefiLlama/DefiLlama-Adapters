/*==================================================
  Modules
  ==================================================*/

const sdk = require('@defillama/sdk');
const abi = require('./abi');

const BigNumber = require('bignumber.js');

/*==================================================
  Settings
  ==================================================*/

const perlinX = '0x5Fa19F612dfd39e6754Bb2E8300E681d1C589Dd4';
const perlErc20 = '0xeca82185adCE47f39c684352B0439f030f860318';
const startBlock = 10923466;
const startTimestamp = 1600923600;

/*==================================================
  TVL
  ==================================================*/

async function tvl(timestamp, block) {

    let balances = {
        [perlErc20] : 0
    };

    if (timestamp < startTimestamp || block < startBlock) {
        return balances;
    }

    const synthCount = await sdk.api.abi.call({
        target: perlinX,
        abi: abi.synthCount,
        block
    });

    let counts = []
    for (let i = 0; i < synthCount.output; i++) {
        counts.push(i)
    }
    const synths = await sdk.api.abi.multiCall({
        block,
        calls: counts.map((count) => {
            return {
                target: perlinX,
                params: count
            }
        }),
        abi: abi.arraySynths
    })
    const synthAddresses = synths.output.map((item) => item.output)

    const emps = (await sdk.api.abi.multiCall({
        calls: synthAddresses.map((address) => {
            return {
                target: perlinX,
                params: address
            }
        }),
        abi: abi.mapSynth_EMP,
    }));

    const empAddresses = emps.output.map((item) => item.output)

    let calls = [];

    empAddresses.forEach((empAddress) => {
        calls.push({
            target: perlErc20,
            params: empAddress,
        });
    });

    let synthBalances = (await sdk.api.abi.multiCall({
        block,
        calls: calls,
        abi: 'erc20:balanceOf'
    })).output;

    synthBalances.forEach((balanceOf) => {
            let balance = balanceOf.output;
            let address = balanceOf.input.target;

            if (BigNumber(balance).toNumber() <= 0) {
                return;
            }

            balances[address] = BigNumber(balances[address] || 0).plus(balance).toFixed();
    });
    return balances;
}

/*==================================================
  Exports
  ==================================================*/

module.exports = {
    start: '2020-09-24',
    ethereum: { tvl }
}
