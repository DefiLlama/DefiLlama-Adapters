
const { aaveExports } = require('../helper/aave')
const methodologies = require('../helper/methodologies')
const { mergeExports } = require('../helper/utils')

const mainMarket = {
	merlin: aaveExports('', '0x6aB5d5E96aC59f66baB57450275cc16961219796', undefined, ['0x5F314b36412765f3E1016632fD1Ad528929536CA'], {v3: true}),
	btr: aaveExports('', '0x6aB5d5E96aC59f66baB57450275cc16961219796', undefined, ['0x5F314b36412765f3E1016632fD1Ad528929536CA'], {v3: true}),
	arbitrum: aaveExports('', '0xa2ddc06baDc817C612111137c0cf6Bd43634EE1a', undefined, ['0xEc579d2cE07401258710199Ff12a5bb56e086a6F'],{v3: true}),
	bsc: aaveExports('', '0x5395201A4DD625a0d69b99D917282f75928416c1', undefined, ['0x672b19DdA450120C505214D149Ee7F7B6DEd8C39'],{v3: true}),
	core: aaveExports('', '0x410d2D3Dc79ec66A2Cfc3A4a0AD4af3a38D38bd0', undefined, ['0x802CB61844325dc9A161bC3A498E3BE1B7b6FE00'], { v3: true }),
	scroll: aaveExports('', '0xFBb77A68ee35e7902F1ABE0Bd34B263023e90c70', undefined, ['0x18cbe70602Ee17f79D56971F685E9EaF49DA53F2'], { v3: true }),
	ethereum: aaveExports('', '0xff12470a969Dd362EB6595FFB44C82c959Fe9ACc', undefined, ['0xfabb0fDca4348d5A40EB1BB74AEa86A1C4eAd7E2'], { v3: true }),
	mantle: aaveExports('', '0xc6517002bE432e60DEb311c2FD264aBdC7CC74F2', undefined, ['0xc8651Bc174A1f9c29dCDc0651917379d29aBE13F'], { v3: true }),
}

const innovativeMarket = {
	merlin: aaveExports('', '0x91b212e9FaF20117Eae59d6289CB38749DDFc070', undefined, ['0x883cb2E2d9c5D4D9aF5b0d37fc39Fa2284405682'], { v3: true }),
	btr:  aaveExports('', '0x90EA8C92AddE4D3f323Dad9E36f0E0395dbc929d', undefined, ['0x4c25c261Fe47bC216113D140BaF72B05E151bcE4'], { v3: true }),
}

module.exports = mergeExports(mainMarket, innovativeMarket)
module.exports.methodology = methodologies.lendingMarket
