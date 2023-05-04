const { stakings } = require("../helper/staking");

const stakingContractsBSC = [
  // stakingContract1 =
  "0x7c82513b69c1b42c23760cfc34234558119a3399",
    // stakingContract2 =
    "0xef9e50A19358CCC8816d9BC2c2355aea596efd06",
    // stakingContract3 =
    "0xa9efab22cCbfeAbB6dc4583d81421e76342faf8b",
    // stakingContract4 =
    "0xfc4493E85fD5424456f22135DB6864Dd4E4ED662",
    // stakingContract5 =
    "0xaF411BF994dA1435A3150B874395B86376C5f2d5",
    // stakingContract6 =
    "0xf13aDbEb27ea9d9469D95e925e56a1CF79c06E90",
    // stakingContract7 =
    "0x160fF3c4A6E9Aa8E4271aa71226Cc811BFEf7ED9",
    // stakingContract8 =
    "0x4C04E53f9aAa17fc2C914694B4Aae57a9d1bE445",
    // stakingContract9 =
    "0x58366902082B90Fca01bE07D929478bD48AcFB19",

];

const stakingContractsETH = [
    // stakingContract1 =
    "0x50014432772b4123D04181727C6EdEAB34F5F988",
    // stakingContract2 =
    "0x9eA966B4023049BFF858BB5E698ECfF24EA54c4A",
    // stakingContract3 =
    "0xD4bE7a106ed193BEe39D6389a481ec76027B2660",
    // stakingContract4 =
    "0x3fAb09ACAeDDAF579d7a72c24Ef3e9EB1D2975c4",
    // stakingContract5 =
    "0xa4da28B8e42680916b557459D338aF6e2D8d458f",
    // stakingContract6 =
    "0x8A30Be7B2780b503ff27dBeaCdecC4Fe2587Af5d",
    // stakingContract7 =
    "0x44bEd8ea3296bda44870d0Da98575520De1735d4",
    // stakingContract8 =
    "0xeb7dd6b50db34f7ff14898d0be57a99a9f158c4d",
  ];

const stakingContractsAVAX = [
    // stakingContract1 =
    "0xaF411BF994dA1435A3150B874395B86376C5f2d5",
    // stakingContract2 =
    "0x8f28110325a727f70B64bffEbf2B9dc94B932452",
    // stakingContract3 =
    "0xd13bdC0c9a9931cF959739631B1290b6BEE0c018",
    // stakingContract4 =
    "0x5536E02336771CFa0317D4B6a042f3c38749535e",
    // stakingContract5 =
    "0x1A4fd0E9046aeD92B6344F17B0a53969F4d5309B",
    // stakingContract6 =
    "0x5566B51a1B7D5E6CAC57a68182C63Cb615cAf3f9",
    // stakingContract7 =
    "0xb1875eeBbcF4456188968f439896053809698a8B",
    // stakingContract8 =
    "0x16429e51A64B7f88D4C018fbf66266A693df64b3",
    // stakingContract9 =
    "0xF035ec2562fbc4963e8c1c63f5c473D9696c59E3",
    // stakingContract10 =
    "0x6eb643813f0b4351b993f98bdeaef6e0f79573e9",
];

const DYP = "0x961C8c0B1aaD0c0b10a51FeF6a867E3091BCef17";

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    staking: stakings(stakingContractsBSC, DYP),
    tvl: (async) => ({}),
  },
  ethereum: {
    staking: stakings(stakingContractsETH, DYP),
    tvl: (async) => ({}),
  },
  avax: {
    staking: stakings(stakingContractsAVAX, DYP),
    tvl: (async) => ({}),
    },

  methodology: "Counts liquidity on the DYP staking contracts",
  
};