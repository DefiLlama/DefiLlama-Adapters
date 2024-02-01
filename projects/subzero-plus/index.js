const { unknownTombs } = require("../helper/unknownTokens")

const avaxZShare = "0xF5b1A0d66856CBF5627b0105714a7E8a89977349"
const avaxChef = "0xDAccfd92e37be54Ca1A8ff37A7922446614b4759" // ZShare reward pool
const avaxBoardroom = "0xa252FfDB3A73Bd0F88Eea39658c7C00a281B3bB6" 
const avaxAbzero = "0xD9Ef0818432b87a17709b62D0cB78a3fEa57Cb00"

const lps = [
  "0xD1D0340d80bee3c6f90116467a78dC3718121100", // SUB-AVAX LP
  "0xbfE8B1f30035262903927F5BfD65319ef09B48B5", // ZSHARE-SUB LP
  "0x763513C7e639A21D0a7d4A5ec60a6e7314Ed00C8", // ZSHARE-AVAX LP
]

module.exports = unknownTombs({
  lps,
  token: avaxAbzero,
  shares: [avaxZShare,],
  rewardPool: [avaxChef],
  masonry: [avaxBoardroom],
  chain: 'avax',
  useDefaultCoreAssets: true,
})
