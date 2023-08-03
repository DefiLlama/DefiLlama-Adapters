const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x8b4334d4812C530574Bd4F2763FcD22dE94A969B";

const tokens = [
  nullAddress,
  ADDRESSES.ethereum.USDC,
  ADDRESSES.ethereum.STETH,
  "0x9C4A4204B79dd291D6b6571C5BE8BbcD0622F050", // TCR
  "0x4104b135DBC9609Fc1A9490E61369036497660c8", // APW
  "0x73968b9a57c6E53d41345FD57a6E6ae27d6CDB2F", // SDT
  "0xE1573B9D29e2183B1AF0e743Dc2754979A40D237", // Uniswap FXS/FRAX LP
  ADDRESSES.ethereum.LIDO,
  ADDRESSES.ethereum.SAFE,
  "0xaa0C3f5F7DFD688C6E646F66CD2a6B66ACdbE434", // stkCvxCrv
  "0x04906695D6D12CF5459975d7C3C03356E4Ccd460", // sOHM
];

const ownTokens = [
  ADDRESSES.ethereum.TOKE,
];

module.exports = treasuryExports({
  ethereum: {
    tokens,
    ownTokens,
    owners: [treasury],
  },
});
