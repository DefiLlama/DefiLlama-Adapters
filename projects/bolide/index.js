const sdk = require('@defillama/sdk')
const abi = require('./abi.json')
const BigNumber = require('bignumber.js')
const { ethers } = require('ethers')

const address = "0xf1f25A26499B023200B3f9A30a8eCEE87b031Ee1";

function toBN(value) {
    let data = value ? value : 0;
    data = !Number.isNaN(data) ? data : 0;

    return new BigNumber(data);
};

function fromWei(value, decimals) {
    const prepValue = value.toString(10).split('.')[0];
    const eth = ethers.utils.formatUnits(prepValue, decimals).toString();

    return toBN(eth);
};

function safeBN(v) {
    const value = v.toString(10);
  
    return value.includes('.') ? value.split('.')[0] : value;
};

async function fetch() {
    const { output } = await sdk.api.abi.call({
        abi: abi.getTotalDeposit,
        target: address,
        params: [],
        chain: "bsc",
    });
    
    return safeBN(fromWei(output, 18).toString(10));
};

module.exports = {
    timetravel: true,
    methodology: '',
    fetch,
};