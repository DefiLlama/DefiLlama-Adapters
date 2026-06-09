const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  methodology: 'Counts IGRA tokens locked by attesters in the Attestation Diamond contract on the Igra chain. Attesters lock IGRA for a 6-month period as a security deposit for state validation; deposits can be slashed.',
  igra: { tvl: sumTokensExport({owner: '0xc24Df70E408739aeF6bF594fd41db4632dF49188', tokens: ['0x093d77d397F8acCbaee0820345E9E700B1233cD1']}) },
}