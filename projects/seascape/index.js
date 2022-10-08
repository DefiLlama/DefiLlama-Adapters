const { getUniTVL } = require('../helper/unknownTokens')

const wMOVR = "0xE3C7487Eb01C74b73B7184D198c7fBF46b34E5AF" // their own barely used version

module.exports={
    misrepresentedTokens: true,
    tvl: getUniTVL({ factory: '0xD184B1317125b166f01e8a0d6088ce1de61D00BA', chain: 'moonriver', useDefaultCoreAssets: true }),
}