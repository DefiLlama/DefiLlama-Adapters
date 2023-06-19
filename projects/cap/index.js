const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, nullAddress, } = require('../helper/unwrapLPs')

const contracts = {
    "treasuryV2": "0x1058AFe66BB5b79C295CCCE51016586949Bc4e8d",
    "trading1": "0x9BC357bc5b312AaCD41a84F3C687F031B8786853",
    "trading2": "0xA55Eee92a46A50A4C65908F28A0BE966D3e71633",
    "trading3": "0xCAEc650502F15c1a6bFf1C2288fC8F819776B2eC",
    "trading4": "0xbEd32937D8A5D1421241F52809908f1a17D75bDb",
    "staking": "0xC8CDd2Ea6A5149ced1F2d225D16a775ee081C67D",
    "ethPool": "0xE0cCd451BB57851c1B2172c07d8b4A7c6952a54e",

    "usdcPool": "0x958cc92297e6F087f41A86125BA8E121F0FbEcF2",
    "usdcPool2": "0xf16033d20adda47dc99ea291d0f4c4fef2ff47af",
};
const cap = "0x031d35296154279dc1984dcd93e392b1f946737b";
const usdc = ADDRESSES.arbitrum.USDC;

module.exports = {
    methodology: "ETH locked on trading contracts",
    arbitrum: {
        staking: sumTokensExport({ owner: contracts.staking, tokens: [ cap ]}),
        tvl: sumTokensExport({ tokensAndOwners: [
            [nullAddress, contracts.trading1], 
            [nullAddress, contracts.trading2], 
            [nullAddress, contracts.trading3], 
            [nullAddress, contracts.trading4], 
            [nullAddress, contracts.ethPool], 
            [usdc, contracts.usdcPool], 
            [usdc, contracts.usdcPool2], 
        ]}),
    }
};