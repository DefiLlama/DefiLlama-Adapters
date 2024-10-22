const { get } = require("../helper/http");

const deepType = "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP"
const suiType = "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI"
const usdcType = "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC"
const bethType = "0xd0e89b2af5e4910726fbcd8b8dd37bb79b29e5f83f7491bca830e94f7f226d29::eth::ETH"
const wusdtType = "0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN"
const wusdcType = "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN"
const endpointUrl = "http://localhost:9008/"
const endpointName = "get_net_deposits/"

async function tvl(api) {
    let url = endpointUrl + endpointName + 
        deepType + "," +
        suiType + "," +
        usdcType + "," +
        bethType + "," +
        wusdtType + "," +
        wusdcType
    console.log(url)
    const data = await get(url)

    api.add(deepType, data[deepType])
    api.add(suiType, data[suiType])
    api.add(usdcType, data[usdcType])
    api.add(bethType, data[bethType])
    api.add(wusdtType, data[wusdtType])
    api.add(wusdcType, data[wusdcType])
}

module.exports = {
    methodology: "All deposits into all BalanceManagers minutes all withdrawals from all BalanceManagers",
    sui: {
        tvl,
    }
}