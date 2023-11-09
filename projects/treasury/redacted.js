const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x086c98855df3c78c6b481b6e1d47bef42e9ac36b"
const treasury2 = "0xa52fd396891e7a74b641a2cb1a6999fcf56b077e"
const treasury3 = "0x42e39157ec770197013e619c0eea8e1139f332db"
const treasury4 = "0xa722ebccd25adb06e5d0190b240d1f4039839822"
const treasury5OP = "0x2e33a660742e813ad948fb9f7d682fe461e5fbf3"
const treasury6ARB = "0x64769c53ff91b83fe9830776a4b85a1f4e1edaad"
const BTRF = "0xc55126051B22eBb829D00368f4B12Bde432de5Da"

module.exports = treasuryExports({
  ethereum: {
    tokens: [
      nullAddress,
      ADDRESSES.ethereum.USDT,
      "0x2ba592F78dB6436527729929AAf6c908497cB200", // CREAM
      ADDRESSES.ethereum.USDC,
      ADDRESSES.ethereum.SAFE,
      "0xaa0C3f5F7DFD688C6E646F66CD2a6B66ACdbE434",
      ADDRESSES.ethereum.DAI,
      "0xaCe78D9BaB82b6B4783120Dba82aa10B040A14D9",
      "0xBCe0Cf87F513102F22232436CCa2ca49e815C3aC",
      ADDRESSES.ethereum.CRV,
    ],
    ownTokens: [BTRF],
    owners: [treasury, treasury2,treasury3,treasury4],
  },
  optimism: {
    tokens: [
      nullAddress,
      ADDRESSES.optimism.OP,
      "0xaf9fe3b5ccdae78188b1f8b9a49da7ae9510f151", // DHT
      ADDRESSES.optimism.USDC,
      "0x3f56e0c36d275367b8c502090edf38289b3dea0d", // QI
      "0x97513e975a7fa9072c72c92d8000b0db90b163c5", //BEETS
      "0x39fde572a18448f8139b7788099f0a0740f51205", //OATH
      "0x00a35fd824c717879bf370e70ac6868b95870dfb", //IB
      "0x3c8b650257cfb5f272f799f5e2b4e65093a11a05", //VELO
    ],
    owners: [treasury5OP],
  },
  arbitrum: {
    tokens: [
      nullAddress,
      ADDRESSES.arbitrum.WETH,
      ADDRESSES.arbitrum.USDC,
      "0x10393c20975cf177a3513071bc110f7962cd67da", // JONES
    ],
    owners: [treasury6ARB],
  },
});