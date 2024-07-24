const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const COLLATERALS = {
  [ADDRESSES.manta.USDC]: {
    activePool: "0x50ef8B64c02B7913f15CbCDF0E7F44CC261195D6",
    defaultPool: "0xac84B99F253F05b00bff36a06fA1CA5f5754E80F",
  },
  [ADDRESSES.manta.USDT]: {
    activePool: "0x74242b001869037594c8b59b191DF7284c6A3801",
    defaultPool: "0xF42cE1F6F90Ea3B6254E2390B7E9467Fb1584AAA",
  },
  // TIA
  "0x6Fae4D9935E2fcb11fC79a64e917fb2BF14DaFaa": {
    activePool: "0x00A14CF3A66De2D4585F399Ed4240d0F2730fFCB",
    defaultPool: "0x6851255D2CEc9D66502282D3C6F11f552186eDA7",
  },
  [ADDRESSES.manta.WETH]: {
    activePool: "0xd58300481551F2bB81343abB5C6288fEaCC72Be4",
    defaultPool: "0x2C903a6858374925f5020B8EA2D88E545515eD4D",
  },
  // MANTA
  "0x95CeF13441Be50d20cA4558CC0a27B601aC544E5": {
    activePool: "0xEBC3E41176C1d63E8B99271cD75dD3FBa907CbAf",
    defaultPool: "0x64a602a31030D531Ca0dF336A811ab0247b87165",
  },
  // wUSDM
  "0xbdAd407F77f44F7Da6684B416b1951ECa461FB07": {
    activePool: "0xdf4A63E03A327E1Fc68460622937A7BcC300e66b",
    defaultPool: "0xF79BA93C02dD2B0529eF254075428aAdb2416595",
  },
  // STONE
  "0xEc901DA9c68E90798BbBb74c11406A32A70652C3": {
    activePool: "0x5Ee4DC855Ca71158CB0516a27e01bDB18C05D923",
    defaultPool: "0x558a64CB6e2e335Fc468ab3215d5c7Fe5dF26F31",
  },
}

function getCollateralOwnersAndToken() {
  const tokensAndOwners = []
  for (const [collateral, collateralInfo] of Object.entries(COLLATERALS)) {
    const { activePool, defaultPool } = collateralInfo
    tokensAndOwners.push([collateral, activePool])
    tokensAndOwners.push([collateral, defaultPool])
  }
  return tokensAndOwners;
}


module.exports = {
  start: 1698768000, // 01 Nov 2023
  methodology: "Total locked collateral assets (in ERC-20 form) in ActivePool and DefaultPool, plus total staked GAI in StabilityPool",
  manta: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        ...getCollateralOwnersAndToken(),
      ]
    }),
  },
};
