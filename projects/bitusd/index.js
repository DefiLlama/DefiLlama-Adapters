const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

const wstRose = "0x3cAbbe76Ea8B4e7a2c0a69812CBe671800379eC8";
const mtBill = "0xDD629E5241CbC5919847783e6C96B2De4754e438";

module.exports = {
  start: '2024-11-30',
  sapphire: {
    tvl: sumTokensExport({
      owners: ['0x9be6f065aFC34ca99e82af0f0BfB9a01E3f919eE', 
               '0x57D51c99b7EB39c978c9E4493D74Ea79495999b0',
               '0x4E77238627F1D2516eb05ec0b0B38f86905d60bc'],
      tokens: [nullAddress, 
               wstRose,
               mtBill]
    }),
  },
}
