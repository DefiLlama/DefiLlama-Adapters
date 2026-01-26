const ADDRESSES = require('../helper/coreAssets.json')

const { aaveExports } = require('../helper/aave')
const methodologies = require('../helper/methodologies')
const { mergeExports } = require('../helper/utils')



//@note Main & Innovative Markets
const mainMarket = {
	merlin: aaveExports('', '0x6aB5d5E96aC59f66baB57450275cc16961219796', undefined, ['0x5F314b36412765f3E1016632fD1Ad528929536CA'], { v3: true, blacklistedTokens: [ADDRESSES.merlin.WBTC_1] }),
	btr: aaveExports('', '0x6aB5d5E96aC59f66baB57450275cc16961219796', undefined, ['0x5F314b36412765f3E1016632fD1Ad528929536CA'], {v3: true}),
	scroll: aaveExports('', '0xFBb77A68ee35e7902F1ABE0Bd34B263023e90c70', undefined, ['0x18cbe70602Ee17f79D56971F685E9EaF49DA53F2'], { v3: true }),
	iotex: aaveExports('', '', undefined, ['0xBa77520d38953BF6a8395D118CfF714Ed672533f'], { v3: true }),
	bsquared: aaveExports('', '', undefined, ['0x4Ea93E846b8C6E7b3D5a5BEDF4fe6B8AED58FCEe'], { v3: true }),
	mode: aaveExports('', '', undefined, ['0xC5b05b7092257Ee3eEAf013198d30F1E8179B6C9'], { v3: true }),
	klaytn: aaveExports('', '', undefined, ['0xddD3D480521bc027596e078BCd1b838d50Daa076'], { v3: true, blacklistedTokens: ['0x585e26627c3b630b3c45b4f0e007db5d90fae9b2'] }), // Kaia V3 Main
	zeta: aaveExports('', '', undefined, ['0xA34F1a928024E3609C8968fEA90C747e8D1fA20f'], { v3: true }), // Zetachain V3 Main
	corn: aaveExports('', '', undefined, ['0x56552f4407113894Bfce34b5b88C57b941AFc519'], { v3: true }), // Corn V3 Main
	duckchain: aaveExports('', '', undefined, ['0x100AC26ad2c253B18375f1dC4BC0EeeB66DEBc88'], { v3: true }), // Duckchain V3 Main
	taiko: aaveExports('', '', undefined, ['0x43248dF19B9B55f7b488CF68A1224308Af2D81eC'], { v3: true }), // Taiko - Main
	goat: aaveExports('', '', undefined, ['0x2c4aEB7C9f0D196a51136B3c7bec49cB2DBD1966'], { v3: true }), // Goat - Main
	plume_mainnet: aaveExports('', '', undefined, ['0x522b3bc00f7DfC5657f8e195868FD062027859e8'], { v3: true }), // Plume - Main
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
	bob: aaveExports('', '', undefined, ['0xfabb0fDca4348d5A40EB1BB74AEa86A1C4eAd7E2'], { v3: true, blacklistedTokens: [ADDRESSES.bob.SolvBTC, ADDRESSES.bob.SolvBTC_BBN] }),
	corn: aaveExports('', '', undefined, ['0xf0d077728D424Ee6C6Eba82d23ce56C2e91E57Ea'], { v3: true }),
	sonic: aaveExports('', '', undefined, ['0x23f02C2eeFe2010298Ab74059393326d3df59a02'], { v3: true }),
	taiko: aaveExports('', '', undefined, ['0xF6Aa54a5b60c324602C9359E8221423793e5205d'], { v3: true, blacklistedTokens: [ADDRESSES.bob.SolvBTC] }), // Taiko - Solv
	sei: aaveExports('', '', undefined, ['0x16b9b88B773C1a1aBA6D305e0560171405d45121'], { v3: true }),
}

const pumpBTCMarkets = {
	ethereum: aaveExports('', '0xE00A3FE97714765A1a2054E850724Fd1320FaCc0', undefined, ['0x2eE0438BCC1876cEA2c6fc43dD21417cF3D1c2eF'], { v3: true }),
	bsc: aaveExports('', '0xb1C93Ba1286b6CCA1496C266f0eBfCe94b0C0cc0', undefined, ['0x58c937fa2D147117dB43d187f9411151edfFf03c'], { v3: true }),
	zeta: aaveExports('', '', undefined, ['0xC5b05b7092257Ee3eEAf013198d30F1E8179B6C9'], { v3: true }),
	arbitrum: aaveExports('', '', undefined, ['0x2c4aEB7C9f0D196a51136B3c7bec49cB2DBD1966'], { v3: true }),
	corn: aaveExports('', '', undefined, ['0x867885c1dB3020E25A86Db7e20E35dC7b81d76A2'], { v3: true }),
}
//
const unibtcMarkets = {
	merlin: aaveExports('', '0x0024818043D04B1Cc9685233D47eF7eea6Df0A5E', undefined, ['0x623700Fee1dF64088f258e2c4DAB4D6aEac4dDA6'], { v3: true }),
	btr: aaveExports('', '', undefined, ['0x898D0EF6E20B7597728AEB41169c22608Fe4b234'], { v3: true }),
	bsc: aaveExports('', '', undefined, ['0xF828A73cB00072843241C6294ed778F26854fe5C'], { v3: true }),
	mode: aaveExports('', '', undefined, ['0x8F016F5dac399F20B34E35CBaF1dFf12eeE2dE74'], { v3: true }),
	iotex: aaveExports('', '', undefined, ['0x28292e1ca36e400FB7d0B66AaA99EB808E3Cb8cB'], { v3: true }),
	bob: aaveExports('', '', undefined, ['0x100AC26ad2c253B18375f1dC4BC0EeeB66DEBc88'], { v3: true }),
}

const stbtcMarkets = {
	bsc: aaveExports('', '', undefined, ['0x56F817eF5D1945E0772496020ff0F72c3984B351'], { v3: true }),
	btr: aaveExports('', '0x90EA8C92AddE4D3f323Dad9E36f0E0395dbc929d', undefined, ['0x4c25c261Fe47bC216113D140BaF72B05E151bcE4'], { v3: true }),
}

const otherProtocolTokenMarkets = {
	// ETH - Swell BTC
	ethereum: aaveExports('', '0x3975BE5E668b189b8Ac9049B96A9D9561c4F5273', undefined, ['0x87Ed94868f6fbaA834Db81a1C5854c445caCaB67'], { v3: true }),
	// BSC - WBTC
	bsc: aaveExports('', '', undefined, ['0xA34F1a928024E3609C8968fEA90C747e8D1fA20f'], { v3: true }),
	// Kaia - stKaia
	klaytn: aaveExports('', '', undefined, ['0x276c5119f63119921667842dA3B71EE10Ac486eA'], { v3: true, blacklistedTokens: ['0x585e26627c3b630b3c45b4f0e007db5d90fae9b2'] }),
	// Sonic - beetSonic
	sonic: aaveExports('', '', undefined, ['0x28350E38f241d7F24106CE5eaB1684D6ebEB4700'], { v3: true }),
	// Duckchain - MBTC
	duckchain: aaveExports('', '', undefined, ['0x912b425D867a09608A884C83b3D5075E9037Aa6a'], { v3: true }),
}

const obtcMarkets = {
	core: aaveExports('', '', undefined, ['0x5c78EbB34cC5b52146D107365A66E37a677Fcf50'], { v3: true }),
}

const ubtcMarkets = {
	core: aaveExports('', '', undefined, ['0x2752237ccC6aB5e4B9e9BFca57D7a6956aF4FE3d'], { v3: true }),
}

const xaumMarkets = {
	bsc: aaveExports('', '', undefined, ['0x2c4aEB7C9f0D196a51136B3c7bec49cB2DBD1966'], { v3: true }),
}

const lbtcMarkets = {
	bsc: aaveExports('', '', undefined, ['0x5b9b3C211B81627Cc6b46824CB26829F31A587dc'], { v3: true }),
	corn: aaveExports('', '', undefined, ['0x5EcDC2432ED77cD8E2cE6183712c5cc712c40ec0'], { v3: true }),
	bob: aaveExports('', '', undefined, ['0x28292e1ca36e400FB7d0B66AaA99EB808E3Cb8cB'], { v3: true }),
}

const listaMarkets = {
	bsc: aaveExports('', '', undefined, ['0x5157f63bE7808DEB090Eee7762e917745896A09E'], { v3: true }), // BSC - ListaDAO
}

const uniIotxMarkets = {
	iotex: aaveExports('', '', undefined, ['0x2c4aEB7C9f0D196a51136B3c7bec49cB2DBD1966'], { v3: true }),
}

	// BSC - USDX
const usdxMarkets = {
		bsc: aaveExports('', '', undefined, ['0x9515dC23bBE46f9C9885D24Fa276745A11b7f9D8'], { v3: true, blacklistedTokens: ['0x7788a3538c5fc7f9c7c8a74eac4c898fc8d87d92', '0xf3527ef8de265eaa3716fb312c12847bfba66cef'] }),
}

module.exports = mergeExports(
	mainMarket, innovativeMarket, solvMarkets, pumpBTCMarkets, unibtcMarkets, stbtcMarkets, otherProtocolTokenMarkets, obtcMarkets, ubtcMarkets, xaumMarkets, lbtcMarkets, listaMarkets, uniIotxMarkets, usdxMarkets
)
module.exports.methodology = methodologies.lendingMarket
