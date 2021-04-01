const web3 = require('./config/web3.js');
const retry = require('async-retry')
const axios = require("axios");




const bCdpManagerAbi = require('./config/b-protocol/bCdpManager.json')
const vatAbi = require('./config/b-protocol/vat.json')
const userInfoAbi = require('./config/b-protocol/UserInfo.json')

const ETH_ILK = "0x4554482d41000000000000000000000000000000000000000000000000000000"

async function runMaker() {

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

async function runCompound() {

    const userInfo = new web3.eth.Contract(userInfoAbi, "0x907403da04eb05efd47eb0ba0c7a7d00d4f233ea")

    const user = "0x0000000000000000000000000000000000000001"
    const comptroller = "0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B"
    const bComptrollerAddress = "0x9db10b9429989cc13408d7368644d4a1cb704ea3"
    const registryAddress = "0xbf698df5591caf546a7e087f5806e216afed666a"
    const sugerDady = "0x35fFd6E268610E764fF6944d07760D0EFe5E40E5"
    const jarConnector = "0xd24e557762589124d7cfef90d870df17c25bff8a"
    const jar = "0xb493d1b6048b801747d72f755b6efbfa1b4c6103"
    const info = await userInfo.methods.getUserInfo(user, comptroller, bComptrollerAddress, registryAddress, sugerDady, jarConnector, jar, true).call()

    let tvl = 0.0

    for(let i = 0 ; i < info.tokenInfo.ctoken.length ; i++) {
      const ctvl = new web3.utils.toBN(info.tvlInfo.ctokenBalance[i]);
      const cExchangeRate = new web3.utils.toBN(info.tokenInfo.ctokenExchangeRate[i]);
      const price = new web3.utils.toBN(info.tokenInfo.underlyingPrice[i]);

      const _1e18 = new web3.utils.toBN(web3.utils.toWei("1"));
      const underlyingBalance = (ctvl).mul(cExchangeRate).div(_1e18);
      const usdBalance = web3.utils.fromWei((underlyingBalance).mul(price).div(_1e18));

      tvl += Number(usdBalance);
    }

    return tvl;
}


async function fetch() {
    var ethTotal = await runMaker();
    var compTotalInUsd = await runCompound();
    var price_feed = await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'))
    var tvl = ethTotal * price_feed.data.ethereum.usd + compTotalInUsd;

    return tvl;
}

module.exports = {
  fetch
}
