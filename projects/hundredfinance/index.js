const ADDRESSES = require('../helper/coreAssets.json')
const {compoundExports, compoundExportsWithAsyncTransform} = require('../helper/compound')
const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const comptroller = "0x0f390559f258eb8591c8e31cf0905e97cf36ace2"

const usdcEth = ADDRESSES.ethereum.USDC
const usdcFantom = ADDRESSES.fantom.USDC
const usdcArbitrum = ADDRESSES.arbitrum.USDC

const daiEth = ADDRESSES.ethereum.DAI
const daiFantom = ADDRESSES.fantom.DAI

const usdtEth = ADDRESSES.ethereum.USDT
const usdtArbitrum = ADDRESSES.arbitrum.USDT

const usdcFantomBAMM = "0xEDC7905a491fF335685e2F2F1552541705138A3D"
const daiFantomBAMM = "0x6d62d6Af9b82CDfA3A7d16601DDbCF8970634d22"
const usdcArbitrumBAMM = "0x04208f296039f482810B550ae0d68c3E1A5EB719"
const usdtArbitrumBAMM = "0x24099000AE45558Ce4D049ad46DDaaf71429b168"


const bamms = {
    "fantom" : [
        {"bamm" : usdcFantomBAMM, "underlying" : usdcFantom, "underlyingEth" : usdcEth },
        { "bamm" : daiFantomBAMM, "underlying" : daiFantom, "underlyingEth" : daiEth }
    ],
    "arbitrum" : [
        {"bamm" : usdcArbitrumBAMM, "underlying" : usdcArbitrum, "underlyingEth" : usdcEth },
        { "bamm" : usdtArbitrumBAMM, "underlying" : usdtArbitrum, "underlyingEth" : usdtEth }
    ]
} 

async function bammTvlFunc(chain, retTvl, unixTimestamp, ethBlock, chainBlocks) {
    const block = chainBlocks[chain]

    const balances = await retTvl(unixTimestamp, ethBlock, chainBlocks)

    for(let bamm of bamms[chain]) {
        const bammBalance = (
            await sdk.api.erc20.balanceOf({
              target: bamm["underlying"],
              owner: bamm["bamm"],
              block: block,
              chain: chain,
            })
          ).output;
        
        const ethToken = bamm["underlyingEth"]
        sdk.util.sumSingleBalance(balances, ethToken, bammBalance)
    }

    return balances
}

function tvlWithBamm() {
    const chain = arguments[1]
    const retVal = compoundExportsWithAsyncTransform(...arguments)
    return {tvl: async(...args)=> bammTvlFunc(chain, retVal.tvl, ...args), borrowed: retVal.borrowed}
}

module.exports={
    hallmarks: [
        [1647302400, "Reentrancy attack"],
        [1681541920, "Protocol hacked (oc Optimism)"],

    ],
    ethereum:compoundExports(comptroller, "ethereum", "0xfCD8570AD81e6c77b8D252bEbEBA62ed980BD64D", ADDRESSES.ethereum.WETH),
    arbitrum:tvlWithBamm(comptroller, "arbitrum", "0x8e15a22853A0A60a0FBB0d875055A8E66cff0235", ADDRESSES.arbitrum.WETH),
    fantom:tvlWithBamm(comptroller, "fantom", "0xfCD8570AD81e6c77b8D252bEbEBA62ed980BD64D", ADDRESSES.fantom.WFTM),
    harmony:compoundExportsWithAsyncTransform(comptroller, "harmony", "0xbb93C7F378B9b531216f9aD7b5748be189A55807", ADDRESSES.harmony.WONE),
    moonriver:compoundExportsWithAsyncTransform("0x7d166777bd19a916c2edf5f1fc1ec138b37e7391", "moonriver", "0xd6fcBCcfC375c2C61d7eE2952B329DcEbA2D4e10", "0x98878b06940ae243284ca214f92bb71a2b032b8a"),
    xdai:compoundExportsWithAsyncTransform("0x6bb6ebCf3aC808E26545d59EA60F27A202cE8586", "xdai", "0x6eDCB931168C9F7C20144f201537c0243b19dCA4", ADDRESSES.xdai.WXDAI),
    polygon:compoundExportsWithAsyncTransform("0xedba32185baf7fef9a26ca567bc4a6cbe426e499", "polygon", "0xEbd7f3349AbA8bB15b897e03D6c1a4Ba95B55e31", ADDRESSES.polygon.WMATIC_2),
    optimism:compoundExportsWithAsyncTransform("0x5a5755E1916F547D04eF43176d4cbe0de4503d5d", "optimism", "0x1A61A72F5Cf5e857f15ee502210b81f8B3a66263", ADDRESSES.tombchain.FTM),
}
