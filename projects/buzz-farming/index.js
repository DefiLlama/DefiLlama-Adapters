const {sumTokensExport} = require('../helper/sumTokens');
const ADDRESSES = require('../helper/coreAssets.json')

const ADDRESSES_BSQUARED_BSTONE = ADDRESSES.bsquared.BSTONE;
const ADDRESSES_BSQUARED_FDUSD = ADDRESSES.bsquared.FDUSD;
const ADDRESSES_BSQUARED_MATIC = ADDRESSES.bsquared.MATIC;
const ADDRESSES_BSQUARED_ORDI = ADDRESSES.bsquared.ORDI;
const ADDRESSES_BSQUARED_SATS = ADDRESSES.bsquared.SATS;
const ADDRESSES_BSQUARED_FBTC = '0x5d247f32b792a61f7b4078cf7752a878aff152e2';
const ADDRESSES_BSQUARED_UBTC = ADDRESSES.bsquared.UBTC;
const ADDRESSES_BSQUARED_USDA = '0x46fecc5bef70615ee3bfdbd2b278944368b78cf5';
const ADDRESSES_BSQUARED_ETH = ADDRESSES.bsquared.ETH;
const ADDRESSES_BSQUARED_UNIBTC = '0x93919784C523f39CACaa98Ee0a9d96c3F32b593e';

const tokenList = [ADDRESSES.null, ADDRESSES.bsquared.USDT, ADDRESSES.bsquared.USDC, ADDRESSES.bsquared.WBTC, ADDRESSES_BSQUARED_BSTONE, ADDRESSES_BSQUARED_FDUSD, ADDRESSES_BSQUARED_MATIC, ADDRESSES_BSQUARED_ORDI, ADDRESSES_BSQUARED_SATS, ADDRESSES_BSQUARED_FBTC, ADDRESSES_BSQUARED_UBTC, ADDRESSES_BSQUARED_USDA, ADDRESSES_BSQUARED_ETH, ADDRESSES_BSQUARED_UNIBTC];


module.exports = {
    hallmarks: [],
    methodology: "Buzz Farming collaborates with well-known BTCFi projects such as Babylon, Lombard, and Bedrock, as well as prominent blockchains, offering users a variety of multifaceted profit strategies. Users can conveniently select and operate investment strategies through Buzz Farming.",

    bsquared: {tvl: sumTokensExport({owner: '0xe677F4B6104726D76DeBc681d7a862CE269aA8F3', tokens: tokenList})},
}
