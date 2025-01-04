const ADDRESSES = require('../helper/coreAssets.json')

function computeStaked({
                         owner = "0x42a856dbEBB97AbC1269EAB32f3bb40C15102819",
                         tokens
                       }) {
  return async function tvl(api) {
    return api.sumTokens({
      owner: owner,
      tokens: tokens
    })
  }
}

module.exports = {
  doublecounted: true,
  methodology: 'Total amount of BTC staked on SatLayer.',
  ethereum: {
    tvl: computeStaked({
      tokens: [
        "0xC96dE26018A54D51c097160568752c4E3BD6C364", // FBTC
        ADDRESSES.ethereum.WBTC,
        "0x004E9C3EF86bc1ca1f0bB5C7662861Ee93350568", // uniBTC
        "0x8236a87084f8B84306f72007F36F2618A5634494", // LBTC
        "0xd9D920AA40f578ab794426F5C90F6C731D159DEf", // SolvBTC.BBN
        "0xF469fBD2abcd6B9de8E169d128226C0Fc90a012e", // PumpBTC
        "0xf6718b2701D4a6498eF77D7c152b2137Ab28b8A3", // stBTC
      ]
    }),
  },
  bsc: {
    tvl: computeStaked({
      tokens: [
        ADDRESSES.bsc.BTCB,
        "0xf6718b2701D4a6498eF77D7c152b2137Ab28b8A3", // stBTC
        "0x1346b618dC92810EC74163e4c27004c921D446a5", // SolvBTC.BBN
      ]
    }),
  },
  btr: {
    tvl: computeStaked({
      owner: "0x2E3c78576735802eD94e52B7e71830e9E44a9a1C",
      tokens: [
        "0xf6718b2701d4a6498ef77d7c152b2137ab28b8a3", // stBTC
        "0x93919784c523f39cacaa98ee0a9d96c3f32b593e", // uniBTC
        ADDRESSES.btr.WBTC,
      ]
    }),
  }
};