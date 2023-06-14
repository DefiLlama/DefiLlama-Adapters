const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const ftm = "0xa1e849b1d6c2fd31c63eef7822e9e0632411ada7";
const op = "0x2a185c8a3c63d7bfe63ad5d950244ffe9d0a4b60";
const eth = "0xea06e1b4259730724885a39ce3ca670efb020e26";

const ftmTokens = [
  nullAddress,
  ADDRESSES.fantom.USDC, // USDC
  "0x841FAD6EAe12c286d1Fd18d1d525DFfA75C7EFFE", // BOO
  ADDRESSES.fantom.WFTM, // WFTM
  "0xc5713B6a0F26bf0fdC1c52B90cd184D950be515C", // LINSPIRIT
  "0xde5ed76e7c05ec5e4572cfc88d1acea165109e44", // DEUS
  "0xc3f069d7439baf6d4d6e9478d9cc77778e62d147", // FLIBERO
  "0xf3A602d30dcB723A74a0198313a7551FEacA7DAc", // BPT-QUARTET
  "0x56aD84b777ff732de69E85813DAEE1393a9FFE10", // BPT-FOTO-II
  "0xe3f201D4676d1Aec0Baa8c70f8f07F14B73B3Aec", // bTAROT
];

const ftmOwnTokens = [
  "0xF24Bcf4d1e507740041C9cFd2DddB29585aDCe1e", // BEETS
  "0xeCAa1cBd28459d34B766F9195413Cb20122Fb942", // BPT-STABEET
  "0x2Cea0dA40cF133721377bB2b0bF4aDc43715BFC3", // BPT-USDCfBEETS
  "0xcdE5a11a4ACB4eE4c805352Cec57E236bdBC3837", // BPT-BEETS-FTM
];

const opTokens = [
  nullAddress,
  ADDRESSES.optimism.OP, // OP
  "0xFdb794692724153d1488CcdBE0C56c252596735F", // LDO
  "0xFE8B128bA8C78aabC59d4c64cEE7fF28e9379921", // BAL
  "0x38f79beFfC211c6c439b0A3d10A0A673EE63AFb4", // BPT-rETH-ETH-gauge
];

const opOwnTokens = [
  "0xEf47a07945D53Ee3a511751375A1ed0B79d6232D", // BPT-STABEET-gauge
  "0x97513e975a7fA9072c72C92d8000B0dB90b163c5", // BEETS
];

const ethTokens = [
  "0x5c6Ee304399DBdB9C8Ef030aB642B10820DB8F56", // B-80BAL-20WETH
  "0x616e8BfA43F920657B3497DBf40D6b1A02D4608d", // auraBAL
  "0xA13a9247ea42D743238089903570127DdA72fE44", // bb-a-USD
];

module.exports = treasuryExports({
  fantom: {
    owners: [ftm],
    tokens: ftmTokens,
    ownTokens: ftmOwnTokens,
  },
  optimism: {
    owners: [op],
    tokens: opTokens,
    ownTokens: opOwnTokens,
  },
  ethereum: {
    owners: [eth],
    tokens: ethTokens,
    ownTokens: [],
  },
});
