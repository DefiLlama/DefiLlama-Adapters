const Web3 = require('web3')
const web3 = require('./config/web3.js');
const abis = require('./config/smoothy/abis.js')
const abisbsc = require('./config/smoothy-bsc/abis.js')

const BigNumber = require("bignumber.js");
const web3bsc = new Web3(new Web3.providers.HttpProvider(`https://bsc-dataseed.binance.org/`));

async function getGWeiFromWei(wei, decimals = 18) {
    return BigNumber(wei)
        .dividedBy(BigNumber(10).pow(decimals))
        .toString(10);
}

async function fetch() {
  let bsctvl = await fetchETH();
  let tvlETH = await fetchBSC();
  return bsctvl + tvlETH
}


async function fetchETH() {
    const imp = '0xe5859f4efc09027a9b718781dcb2c6910cac6e91';
    const dacontract = new web3.eth.Contract(abis.abis.smoothy, imp)
    const allTokens = abis.abis.tokens;

    let tvl = BigNumber(0);
    await Promise.all(
        allTokens.map(async (token) => {
            const result = await dacontract.methods.getTokenStats(token.id).call();
            let balance = result[2];
            tvl = tvl.plus(await getGWeiFromWei(balance, token.decimals));
        })
    )
    tvl = tvl.toFixed(2);
    return parseFloat(tvl);
}




async function fetchBSC() {
    const imp = '0xe5859f4efc09027a9b718781dcb2c6910cac6e91';
    const dacontract = new web3bsc.eth.Contract(abisbsc.abis.smoothy, imp)
    const allTokens = abisbsc.abis.bsctokens;

    let tvl = BigNumber(0);
    await Promise.all(
        allTokens.map(async (token) => {
            const result = await dacontract.methods.getTokenStats(token.id).call();
            let balance = result[2];
            tvl = tvl.plus(await getGWeiFromWei(balance, token.decimals));
        })
    )
    tvl = tvl.toFixed(2);
    return parseFloat(tvl);
}



module.exports = {
    fetch
}
