const { default: axios } = require("axios")
// const BigNumber = require('bignumber.js')
const sdk = require('@defillama/sdk')

const params = {
    method: 'tvl_value',
  };
  
const data = Object.keys(params)
.map((key) => `${key}=${encodeURIComponent(params[key])}`)
.join('&');

async function tvl(timestamp, ethBlock, chainBlocks) {
    let balance = await axios.post('https://unifarm.co/ajax.php', data, { Headers: {"content-type": "application/x-www-form-urlencoded; charset=UTF-8"}})
    let val = balance.data.tvl_value.replace((/[$,]+/g),"")
    const balances = {'Tether': parseFloat(val)};
    return balances;
}

async function totalValueLock(timestamp, ethBlock, chainBlocks) {
    return await tvl(timestamp, ethBlock, chainBlocks)
}

module.exports = {
    tvl: totalValueLock
}