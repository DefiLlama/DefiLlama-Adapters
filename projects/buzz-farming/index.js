const {sumTokensExport} = require('../helper/sumTokens');
const ADDRESSES = require('../helper/coreAssets.json')

const ADDRESSES_BSQUARED_BSTONE = '0x7537C1F80c9E157ED7AFD93a494be3e1f04f1462';
const ADDRESSES_BSQUARED_FDUSD = '0xC2Fe4f673455Ef92299770a09CDB5E8756A525D5';
const ADDRESSES_BSQUARED_MATIC = '0xc3ee2Df14B1Bc526c24ED802f1873d49664a0d5c';
const ADDRESSES_BSQUARED_ORDI = '0xa0f4470B714677AEEcE0d20074c540b3Cf6a477E';
const ADDRESSES_BSQUARED_SATS = '0x7eBFcE05E418C380a2b6EB0F65995cA04ef4bc00';
const ADDRESSES_BSQUARED_FBTC = '0x5d247f32b792a61f7b4078cf7752a878aff152e2';
const ADDRESSES_BSQUARED_UBTC = '0x796e4d53067ff374b89b2ac101ce0c1f72ccaac2';
const ADDRESSES_BSQUARED_USDA = '0x46fecc5bef70615ee3bfdbd2b278944368b78cf5';
const ADDRESSES_BSQUARED_ETH = '0xd48d3a551757ac47655fce25bde1b0b6b1cb2a5a';

const tokenList = [ADDRESSES.null, ADDRESSES.bsquared.USDT, ADDRESSES.bsquared.USDC, ADDRESSES.bsquared.WBTC, ADDRESSES_BSQUARED_BSTONE, ADDRESSES_BSQUARED_FDUSD, ADDRESSES_BSQUARED_MATIC, ADDRESSES_BSQUARED_ORDI, ADDRESSES_BSQUARED_SATS, ADDRESSES_BSQUARED_FBTC, ADDRESSES_BSQUARED_UBTC, ADDRESSES_BSQUARED_USDA, ADDRESSES_BSQUARED_ETH,];


module.exports = {
    hallmarks: [],
    methodology: "Buzz Farming collaborates with well-known BTCFi projects such as Babylon, Lombard, and Bedrock, as well as prominent blockchains, offering users a variety of multifaceted profit strategies. Users can conveniently select and operate investment strategies through Buzz Farming.",

    bsquared: {tvl: sumTokensExport({owner: '0xe677F4B6104726D76DeBc681d7a862CE269aA8F3', tokens: tokenList})},
}
