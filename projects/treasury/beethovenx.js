const ADDRESSES = require("../helper/coreAssets.json");
const { nullAddress, treasuryExports } = require("../helper/treasury");

const ftm = "0xa1e849b1d6c2fd31c63eef7822e9e0632411ada7";
const op = "0x2a185c8a3c63d7bfe63ad5d950244ffe9d0a4b60";
const eth = "0xea06e1b4259730724885a39ce3ca670efb020e26";

const ftmTokens = [
  nullAddress,
  ADDRESSES.fantom.USDC, // USDC
  "0x841FAD6EAe12c286d1Fd18d1d525DFfA75C7EFFE", // BOO
  ADDRESSES.fantom.WFTM, // WFTM
  "0x91a40c733c97a6e1bf876eaf9ed8c08102eb491f", // lzDAI
  ADDRESSES.fantom.USDC_L0, // lzUSDC
  "0xcc1b99dDAc1a33c201a742A1851662E87BC7f22C", // lzUSDT
  "0xf1648C50d2863f780c57849D812b4B7686031A3D", // lzWBTC
  "0x695921034f0387eAc4e11620EE91b1b15A6A09fE", // lzWETH
  "0xc5713B6a0F26bf0fdC1c52B90cd184D950be515C", // LINSPIRIT
  "0xde5ed76e7c05ec5e4572cfc88d1acea165109e44", // DEUS
  "0xc3f069d7439baf6d4d6e9478d9cc77778e62d147", // FLIBERO
  "0xf3A602d30dcB723A74a0198313a7551FEacA7DAc", // BPT-QUARTET
  "0x56aD84b777ff732de69E85813DAEE1393a9FFE10", // BPT-FOTO-II
  "0xe3f201D4676d1Aec0Baa8c70f8f07F14B73B3Aec", // bTAROT
  "0x838229095fa83bcd993ef225d01a990e3bc197a8", // BPT-lzFOTO
];

const ftmOwnTokens = [
  "0xF24Bcf4d1e507740041C9cFd2DddB29585aDCe1e", // BEETS
  "0x2Cea0dA40cF133721377bB2b0bF4aDc43715BFC3", // BPT-USDCfBEETS
  "0xcdE5a11a4ACB4eE4c805352Cec57E236bdBC3837", // BPT-BEETS-FTM
];

const opTokens = [
  nullAddress,
  ADDRESSES.optimism.OP, // OP
  ADDRESSES.optimism.USDC,
  "0xFdb794692724153d1488CcdBE0C56c252596735F", // LDO
  "0xFE8B128bA8C78aabC59d4c64cEE7fF28e9379921", // BAL
  "0xEf47a07945D53Ee3a511751375A1ed0B79d6232D", // BPT-STABEET-gauge
  "0x38f79beFfC211c6c439b0A3d10A0A673EE63AFb4", // BPT-rETH-ETH-gauge
  "0x61ac9315a1Ae71633E95Fb35601B59180eC8d61d", // BPT-rETH-ETH-aura-vault
  "0x9f43f726dF654E033B04c39989af90ab44875fEB", // BPT-wstETH-ETH-CL-aura-vault
  "0x23Ca0306B21ea71552B148cf3c4db4Fc85AE1929", // BPT-3stable
  "0x88726Ff53eE2dc7F55C17FBd93521B8B92519f49", // BPT-3stable-gauge
];

const opOwnTokens = [
  "0x97513e975a7fA9072c72C92d8000B0dB90b163c5", // BEETS
];

const ethTokens = [
  ADDRESSES.ethereum.USDC,
  ADDRESSES.ethereum.DAI,
  ADDRESSES.ethereum.USDT,
  ADDRESSES.ethereum.WETH,
  ADDRESSES.ethereum.WBTC,
  "0x5c6Ee304399DBdB9C8Ef030aB642B10820DB8F56", // B-80BAL-20WETH
  "0xc128a9954e6c874ea3d62ce62b468ba073093f25", // veBAL
  "0x616e8BfA43F920657B3497DBf40D6b1A02D4608d", // auraBAL
  "0x3fa73f1e5d8a792c80f426fc8f84fbf7ce9bbcac", // vlAURA
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
