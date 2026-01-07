const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

const wstRose = "0x3cAbbe76Ea8B4e7a2c0a69812CBe671800379eC8";
const mtBill = "0xDD629E5241CbC5919847783e6C96B2De4754e438";

module.exports = {
  start: '2024-11-30',
  sapphire: {
    tvl: sumTokensExport({
      owners: ['0x9be6f065aFC34ca99e82af0f0BfB9a01E3f919eE', 
               '0x57D51c99b7EB39c978c9E4493D74Ea79495999b0',
               '0x4E77238627F1D2516eb05ec0b0B38f86905d60bc',
               '0x6467b1de26Ef56b9b8B15Ed639e3A89D5226921E',
               '0x8022Ca13D04B92ad0d68537d4a9305Acd48d7216',
               '0xBE21F6554344E916fd6E0fa66A07f5613F51BDc8',
               '0x53C8915a1A7dFed4768541362Bfa4b2209D0aee4'],
      tokens: [nullAddress, 
               wstRose,
               mtBill]
    }),
  },
}
