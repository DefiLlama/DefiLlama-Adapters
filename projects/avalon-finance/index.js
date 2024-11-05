
const { aaveExports } = require('../helper/aave')
const methodologies = require('../helper/methodologies')
const { mergeExports } = require('../helper/utils')

//@note Main & Innovative Markets
const mainMarket = {
	merlin: aaveExports('', '0x6aB5d5E96aC59f66baB57450275cc16961219796', undefined, ['0x5F314b36412765f3E1016632fD1Ad528929536CA'], {v3: true}),
	btr: aaveExports('', '0x6aB5d5E96aC59f66baB57450275cc16961219796', undefined, ['0x5F314b36412765f3E1016632fD1Ad528929536CA'], {v3: true}),
	scroll: aaveExports('', '0xFBb77A68ee35e7902F1ABE0Bd34B263023e90c70', undefined, ['0x18cbe70602Ee17f79D56971F685E9EaF49DA53F2'], { v3: true }),
	iotex: aaveExports('', '', undefined, ['0xBa77520d38953BF6a8395D118CfF714Ed672533f'], { v3: true }),
	bsquared: aaveExports('', '', undefined, ['0x4Ea93E846b8C6E7b3D5a5BEDF4fe6B8AED58FCEe'], { v3: true }),
}

const innovativeMarket = {
	merlin: aaveExports('', '0x91b212e9FaF20117Eae59d6289CB38749DDFc070', undefined, ['0x883cb2E2d9c5D4D9aF5b0d37fc39Fa2284405682'], { v3: true }),
}

//@note Protocol based markets: Solv, pumpBTC, stbtc, unibtc, others
const solvMarkets = {
	base: aaveExports('', '', undefined, ['0xA9D15C669940a757Ab76C6604f2f8f1e198f7D50'], { v3: true }),
	bsc: aaveExports('', '0x5395201A4DD625a0d69b99D917282f75928416c1', undefined, ['0x672b19DdA450120C505214D149Ee7F7B6DEd8C39'], { v3: true }),
	ethereum: aaveExports('', '0xff12470a969Dd362EB6595FFB44C82c959Fe9ACc', undefined, ['0xfabb0fDca4348d5A40EB1BB74AEa86A1C4eAd7E2'], { v3: true }),
	core: aaveExports('', '0x410d2D3Dc79ec66A2Cfc3A4a0AD4af3a38D38bd0', undefined, ['0x802CB61844325dc9A161bC3A498E3BE1B7b6FE00'], { v3: true }),
	arbitrum: aaveExports('', '0xa2ddc06baDc817C612111137c0cf6Bd43634EE1a', undefined, ['0xEc579d2cE07401258710199Ff12a5bb56e086a6F'], { v3: true }),
	bob: aaveExports('', '', undefined, ['0xfabb0fDca4348d5A40EB1BB74AEa86A1C4eAd7E2'], { v3: true }),
}

const pumpBTCMarkets = {
	ethereum: aaveExports('', '0xE00A3FE97714765A1a2054E850724Fd1320FaCc0', undefined, ['0x2eE0438BCC1876cEA2c6fc43dD21417cF3D1c2eF'], { v3: true }),
	bsc: aaveExports('', '0xb1C93Ba1286b6CCA1496C266f0eBfCe94b0C0cc0', undefined, ['0x58c937fa2D147117dB43d187f9411151edfFf03c'], { v3: true }),
}

const unibtcMarkets = {
	merlin: aaveExports('', '0x0024818043D04B1Cc9685233D47eF7eea6Df0A5E', undefined, ['0x623700Fee1dF64088f258e2c4DAB4D6aEac4dDA6'], { v3: true }),
	btr: aaveExports('', '', undefined, ['0x898D0EF6E20B7597728AEB41169c22608Fe4b234'], { v3: true }),
	bsc: aaveExports('', '', undefined, ['0xF828A73cB00072843241C6294ed778F26854fe5C'], { v3: true }),
}

const stbtcMarkets = {
	bsc: aaveExports('', '', undefined, ['0x56F817eF5D1945E0772496020ff0F72c3984B351'], { v3: true }),
	btr: aaveExports('', '0x90EA8C92AddE4D3f323Dad9E36f0E0395dbc929d', undefined, ['0x4c25c261Fe47bC216113D140BaF72B05E151bcE4'], { v3: true }),
}

const otherProtocolTokenMarkets = {
	// ETH - Swell BTC
	ethereum: aaveExports('', '0x3975BE5E668b189b8Ac9049B96A9D9561c4F5273', undefined, ['0x87Ed94868f6fbaA834Db81a1C5854c445caCaB67'], { v3: true }),
}

module.exports = mergeExports(
	mainMarket, innovativeMarket, solvMarkets, pumpBTCMarkets, unibtcMarkets, stbtcMarkets, otherProtocolTokenMarkets
)
module.exports.methodology = methodologies.lendingMarket
