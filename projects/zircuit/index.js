const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const ZIRCUIT_STAKING_CONTRACT = '0xf047ab4c75cebf0eb9ed34ae2c186f3611aeafa6';

const TOKEN_CONTRACTS = [
    '0xa1290d69c65a6fe4df752f95823fae25cb99e5a7', // rsETH
    '0xbf5495Efe5DB9ce00f80364C8B423567e58d2110', // ezETH
    '0x8c1BEd5b9a0928467c9B1341Da1D7BD5e10b6549', // lsETH
    ADDRESSES.ethereum.WETH, // ETH
    '0xFAe103DC9cf190eD75350761e95403b7b8aFa6c0', // rswETH
    '0x49446A0874197839D15395B908328a74ccc96Bc0', // mstETH
    '0xE46a5E19B19711332e33F33c2DB3eA143e86Bc10', // mwBETH
    '0x32bd822d615A3658A68b6fDD30c2fcb2C996D678', // mswETH
    ADDRESSES.ethereum.WSTETH, // wstETH
    '0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee', // weETH
    '0xf951E335afb289353dc249e82926178EaC7DEd78', // swETH
    '0x4c9EDD5852cd905f086C759E8383e09bff1E68B3', // USDe
    ADDRESSES.ethereum.STONE, // cSTONE
    '0xd5F7838F5C461fefF7FE49ea5ebaF7728bB0ADfa', // mETH
    '0xD9A442856C234a39a81a089C06451EBAa4306a72', // pufETH
    '0x18f313Fc6Afc9b5FD6f0908c1b3D476E3feA1DD9'  // egETH
];

module.exports = {
    ethereum: {
        tvl: sumTokensExport({ 
          owner: ZIRCUIT_STAKING_CONTRACT, 
          tokens: TOKEN_CONTRACTS,
        }),
    }
};