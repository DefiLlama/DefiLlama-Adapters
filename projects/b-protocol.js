const Web3 = require('web3')
const env = require('dotenv').config()
const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${env.parsed.INFURA_KEY}`));
const retry = require('async-retry')
const axios = require("axios");




const bCdpManagerAbi = require('./config/b-protocol/bCdpManager.json')
const vatAbi = require('./config/b-protocol/vat.json')


const ETH_ILK = "0x4554482d41000000000000000000000000000000000000000000000000000000"

async function run() {

    const bCdpManager = new web3.eth.Contract(bCdpManagerAbi, "0x3f30c2381CD8B917Dd96EB2f1A4F96D91324BBed")
    const vat = new web3.eth.Contract(vatAbi, "0x35D1b3F3D7966A1DFe207aa4514C12a259A0492B")

    const maxCdp = await bCdpManager.methods.cdpi().call()
    //console.log(maxCdp);
    let ethTvl = 0
    for(let i = 0 ; i <= maxCdp ; i++) {
        const urn = await bCdpManager.methods.urns(i).call()
        const vault = await vat.methods.urns(ETH_ILK, urn).call()

        const ethDeposit = Number(web3.utils.fromWei(vault.ink))

        ethTvl += ethDeposit
    }

    return ethTvl
}


async function fetch() {
    var ethTotal = await run();
    var price_feed = await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'))
    var tvl = ethTotal * price_feed.data.ethereum.usd
    return tvl;
}

module.exports = {
  fetch
}
