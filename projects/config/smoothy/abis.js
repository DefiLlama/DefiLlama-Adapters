const ADDRESSES = require('../../helper/coreAssets.json')
let abis = {};

abis.smoothy = {
    _ntokens: "uint256:_ntokens",
    getTokenStats: "function getTokenStats(uint256 bTokenIdx) view returns (uint256 softWeight, uint256 hardWeight, uint256 balance, uint256 decimals)",
  };


abis.tokens = [
    {
        symbol: "USDT",
        address: ADDRESSES.ethereum.USDT,
        id: 0,
        decimals: 6,
    },
    {
        symbol: "USDC",
        address: ADDRESSES.ethereum.USDC,
        id: 1,
        decimals: 6,
    },
    {
        symbol: "DAI",
        address: ADDRESSES.ethereum.DAI,
        id: 2,
        decimals: 18,
    },
    {
        symbol: "TUSD",
        address: ADDRESSES.ethereum.TUSD,
        id: 3,
        decimals: 18,
    },
    {
        symbol: "sUSD",
        address: ADDRESSES.ethereum.sUSD,
        id: 4,
        decimals: 18,
    },
    {
        symbol: "BUSD",
        address: ADDRESSES.ethereum.BUSD,
        id: 5,
        decimals: 18,
    },
    {
        symbol: "PAX",
        address: "0x8e870d67f660d95d5be530380d0ec0bd388289e1",
        id: 6,
        decimals: 18,
    },
    {
        symbol: "GUSD",
        address: "0x056fd409e1d7a124bd7017459dfea2f387b6d5cd",
        id: 7,
        decimals: 2,
    },
];

module.exports = {
    abis
}
