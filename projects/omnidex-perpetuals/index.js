const { gmxExports } = require('../helper/gmx')

//Telos
const Vault = '0x8F23134EBc390856E01993dE9f7F837bcD93014a';

module.exports = {
    telos: {
        tvl: gmxExports({ vault: Vault })
    },
};