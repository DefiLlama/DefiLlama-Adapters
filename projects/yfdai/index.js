const Web3 = require('web3');
require("dotenv").config();
let web3RpcUrl = process.env.ETHEREUM_RPC;
const web3 = new Web3(new Web3.providers.HttpProvider(web3RpcUrl));
module.exports = web3;
const retry = require('../helper/retry')
const axios = require("axios");
const BigNumber = require("bignumber.js");
const abi = require('./abi');

async function fetch() {

    const yfdaiTokenAddress = "0xf4CD3d3Fda8d7Fd6C5a500203e38640A70Bf9577";

    const YfDaiETHLP72HRSAddress = "0x75E9F410e8d1D7240b67ec6FE35FA37580b814d9";
    const YfDaiETHLP30DayAddress = "0x8D704D4107CBE5ebE8c0236C5506b30Bf8Bad305";
    const YfDaiETHLP60DayAddress = "0x26572bf2620108cb5006987e6348c07dc4e14a0f";
    const YfDaiETHLP90DayAddress = "0x175d6cbaeff93734ada4c5430815f2208a6b040c";
    const YfDaiStakingAdddress = "0x44d771D0C998f524ff39aB6Df64B72bce1d09566";
    const YfDaiSafetradeStakingAddress = "0x4599cDa238Fb71573fd5A0076C199320e09BCfF0";
    const impulsevenStakingAddress = "0xc0c135D29ba6BB1Ca5F88571A0c45807C3015c64";

    const yfDaiToken = await new web3.eth.Contract(abi.minERC20, yfdaiTokenAddress);

    const balance1 = await yfDaiToken.methods.balanceOf(YfDaiETHLP72HRSAddress).call();
    const balance2 = await yfDaiToken.methods.balanceOf(YfDaiETHLP30DayAddress).call();
    const balance3 = await yfDaiToken.methods.balanceOf(YfDaiETHLP60DayAddress).call();
    const balance4 = await yfDaiToken.methods.balanceOf(YfDaiETHLP90DayAddress).call();
    const balance5 = await yfDaiToken.methods.balanceOf(YfDaiStakingAdddress).call();
    const balance6 = await yfDaiToken.methods.balanceOf(YfDaiSafetradeStakingAddress).call();
    const balance7 = await yfDaiToken.methods.balanceOf(impulsevenStakingAddress).call();

    const totalBalance = parseInt(balance1) + parseInt(balance2) + parseInt(balance3) + parseInt(balance4) + parseInt(balance5) + parseInt(balance6) + parseInt(balance7);

    let price_feed = await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=yfdai-finance&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'))
    const jsondata = await JSON.stringify(price_feed.data["yfdai-finance"].usd);
    return (new BigNumber(totalBalance).div(10 ** 18) * jsondata);
}

module.exports = {
    fetch
}