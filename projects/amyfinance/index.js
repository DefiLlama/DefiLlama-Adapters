const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

const tokens = [
    ADDRESSES.arbitrum.USDC, 
    ADDRESSES.arbitrum.USDT, 
    ADDRESSES.optimism.DAI, 
    ADDRESSES.arbitrum.WBTC, 
    ADDRESSES.arbitrum.WETH, 
    "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0", 
    ADDRESSES.arbitrum.LINK, 
    ADDRESSES.arbitrum.MIM, 
    "0xd4d42F0b6DEF4CE0383636770eF773390d85c61A", 
];
const aibContracts = [
    "0xe76a422C30B09f8d20ad5d8A9D21206835F6c692", //aibUSDC
    "0xE3575B6226a7965f5289C2C6eF2f9C89b6d70941", //aibUSDT
    "0xa6F7A3e16fFC0fE08C43e72C5BB5E15d98c79a05", //aibDAI
    "0x2b3554d6810FA2CEc563b0bC731AbAC60A717f3B", //aibWBTC
    "0x8C1b5FE3A884118569707d07049fbc56A8314CcE", //aibWETH
    "0xE85B64dDA773CB18E0F2a2211Da60DaA536C0284", //aibUNI
    "0x9Dd192fca6A1E7c8a3C014a35087dE3fb9Da14E5", //aibLINK
    "0x381F8482ee0a12202F2A3735370859f5709B12d2", //aibMIM
    "0x52444Aa321dfD7b24aA263Af6F7DCC26565f3629", //aibSUSHI
]

module.exports = {
    arbitrum: { tvl: sumTokensExport({ owners: aibContracts, tokens }), },
    deadFrom: '2022-10-23'
}
