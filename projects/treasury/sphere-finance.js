const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports } = require("../helper/treasury");

const investment_treasury_polygon =   "0x20d61737f972eecb0af5f0a85ab358cd083dd56a"
const liquid_pool_treasury_polygon = "0x1a2ce410a034424b784d4b228f167a061b94cff4"
const rfv_treasury = "0x826b8d2d523e7af40888754e3de64348c00b99f4"
const treasuryBSC = "0x124e8498a25eb6407c616188632d40d80f8e50b0"
const treasuryARB ="0xA6efac6a6715CcCE780f8D9E7ea174C4d85dbE02"
const treasuryOP = "0x93b0a33911de79b897eb0439f223935af5a60c24"
const treasuryCH = "0x74b514bc1b9480e1daca0f83a1e42b86291eadef"
const multisig = "0x79e51953f023df68fc46170d1ee47fd5a49d3b6e"

module.exports = treasuryExports({
  polygon: {
    tokens: [ 
        nullAddress,
        ADDRESSES.polygon.WMATIC_1,
        "0x236eeC6359fb44CCe8f97E99387aa7F8cd5cdE1f",
        ADDRESSES.polygon.WETH_1,
        ADDRESSES.polygon.WMATIC,
        ADDRESSES.polygon.USDC

     ],
    owners: [investment_treasury_polygon, liquid_pool_treasury_polygon, rfv_treasury, treasuryCH, multisig],
    ownTokens: ["0x17e9C5b37283ac5fBE527011CeC257b832f03eb3", "0x8D546026012bF75073d8A586f24A5d5ff75b9716"],
  },
  bsc: {
    tokens: [ 
        nullAddress,
        "0xe80772Eaf6e2E18B651F160Bc9158b2A5caFCA65",
        "0x52F24a5e03aee338Da5fd9Df68D2b6FAe1178827",
        ADDRESSES.bsc.BUSD,
        "0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11"
     ],
    owners: [treasuryBSC],
    ownTokens: [],
  },
  arbitrum: {
    tokens: [ 
        nullAddress,
        "0xe80772Eaf6e2E18B651F160Bc9158b2A5caFCA65",
        ADDRESSES.arbitrum.USDC,
        ADDRESSES.arbitrum.USDT,
        ADDRESSES.arbitrum.GMX,
        ADDRESSES.arbitrum.WBTC,
        "0x15b2fb8f08E4Ac1Ce019EADAe02eE92AeDF06851",
        "0xC36442b4a4522E871399CD717aBDD847Ab11FE88"
     ],
    owners: [treasuryARB],
    ownTokens: [],
    resolveUniV3: true,
  },
  optimism: {
    tokens: [ 
        nullAddress,
        ADDRESSES.optimism.OP,
        ADDRESSES.optimism.USDC,
        "0x73cb180bf0521828d8849bc8CF2B920918e23032"
     ],
    owners: [treasuryOP],
    ownTokens: [],
  },
})