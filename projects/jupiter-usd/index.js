/* JupUSD mint: JuprjznTrTSp2UFa3ZBUFgwdAmtZCq4MQCwysN55USD
JupUSD program: JUPUSDecMzAVgztLe6eGhwUBj1Pn3j9WAXwmtHmfbRr

backing reserves:
Program: CkzLnD9r4d4ZZofsgNVo2VNunxDmte5YJ4vfAgMfBZNA
Custodian: B3q4P4XSmycvoHLaiEjchsGDafFPhKokvHvNRuW29N1y */

const { sumTokens2 } = require('../helper/solana')

module.exports = {
  methodology: `Tokens backing the minted JupUSD`,
  solana: {
    tvl: api => sumTokens2({ api, owners: ['CkzLnD9r4d4ZZofsgNVo2VNunxDmte5YJ4vfAgMfBZNA', 'B3q4P4XSmycvoHLaiEjchsGDafFPhKokvHvNRuW29N1y'] }),
  },
}