const { sumTokensExport } = require('../helper/chain/ton')

const CES_MASTER = "0:a5d12e31be87867851a28d3ce271203c8fa1a28ae826256e73c506d94d49edad"
const CES_STAKING_CONTRACT = "0:29f90533937d696105883b981e9427d1ae411eef5b08eab83f4af89c495d27df"
const DEDUST_TON_CES_POOL = "0:123e245683bd5e93ae787764ebf22291306f4a3fcbb2dcfcf9e337186af92c83"
const STONFI_CES_TON_POOL = "0:6a839f7a9d6e5303d71f51e3c41469f2c35574179eb4bfb420dca624bb989753"

const XROCK_MASTER = "0:157c463688a4a91245218052c5580807792cf6347d9757e32f0ee88a179a6549"
const XROCK_STAKING_CONTRACT = "0:c84deaf1d956d5f80be722bbdaeeba33d70d068ace97c6fc23e1bfeb5689e1ca"
const DEDUST_XROCK_USDT_POOL = "0:9cf96b400deedd4143bd113d8d767f0042515e2ad510c4b4adbe734cd30563b8"
const STONFI_XROCK_USDT_POOL = "0:6ba0e19f6adacbefdcbbc859407241eff578f4a57edc8e3e05e86dcfbb283f20"

module.exports = {
    methodology: "Counts swap.coffee smartcontract balance as TVL.",
    timetravel: false,
    ton: {
        tvl: () => { },
        staking: sumTokensExport({
            owners: [CES_STAKING_CONTRACT, XROCK_STAKING_CONTRACT],
            tokens: [XROCK_MASTER, CES_MASTER],
            onlyWhitelistedTokens: true
        }),
        pool2: sumTokensExport({
            owners: [CES_STAKING_CONTRACT, XROCK_STAKING_CONTRACT],
            tokens: [DEDUST_TON_CES_POOL, STONFI_CES_TON_POOL, DEDUST_XROCK_USDT_POOL, STONFI_XROCK_USDT_POOL],
            onlyWhitelistedTokens: true
        })
    }
}