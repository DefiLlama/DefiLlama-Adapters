const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
        '0x8fd589aa8bfa402156a6d1ad323fec0ecee50d9d', // NEXO TOKEN
        '0xb60c61dbb7456f024f9338c739b02be68e3f545c',
        '0x57793e249825492212de2aa4306379017301e1da', // NEXO TOKEN
        '0x9bdb521a97e95177bf252c253e256a60c3e14447', // This wallet is also staking 5,134.81 ETH on lido 
        '0xffec0067f5a79cff07527f63d83dd5462ccf8ba4',
        '0x55e4d16f9c3041eff17ca32850662f3e9dddbce7', 
        '0x7344e478574acbe6dac9de1077430139e17eec3d', // This wallet is also staking 0.32 ETH on lido + Deposited 10.07 BTC into aave and borrow 564,398 REN 
        '0x6914fc70fac4cab20a8922e900c4ba57feecf8e1',
        '0xf36a47300f002c0c9f8c131962f077c3543b2fc6',
        '0x7ab6c736baf1dac266aab43884d82974a9adcccf',
        '0xa75ede99f376dd47f3993bc77037f61b5737c6ea',
        '0x65b0bf8ee4947edd2a500d74e50a3d757dc79de0',
        '0x0031e147a79c45f24319dc02ca860cb6142fcba1',
        '0x00ee047a66d5cff27587a61559138c26b62f7ceb',
        '0x354e9fa5c6ee7e6092158a8c1b203ccac932d66d',
        '0xba90b5bc12daab8d06582967a22c86ae7eed0469',

    ],
  },
  polygon: {
    owners: [
        '0xb60c61dbb7456f024f9338c739b02be68e3f545c',
        '0x9bdb521a97e95177bf252c253e256a60c3e14447',
        '0x7344e478574acbe6dac9de1077430139e17eec3d',
        '0x6914fc70fac4cab20a8922e900c4ba57feecf8e1',
        '0x7ab6c736baf1dac266aab43884d82974a9adcccf',
        '0xa75ede99f376dd47f3993bc77037f61b5737c6ea',
    ]
  },
  bsc: {
    owners: [
        '0xb60c61dbb7456f024f9338c739b02be68e3f545c',
        '0x9bdb521a97e95177bf252c253e256a60c3e14447',
        '0x55e4d16f9c3041eff17ca32850662f3e9dddbce7',
        '0x7344e478574acbe6dac9de1077430139e17eec3d',
        '0x6914fc70fac4cab20a8922e900c4ba57feecf8e1',
        '0xf36a47300f002c0c9f8c131962f077c3543b2fc6',
        '0x7ab6c736baf1dac266aab43884d82974a9adcccf',
        '0xa75ede99f376dd47f3993bc77037f61b5737c6ea',
    ]
  },
  fantom: {
    owners: [
        '0xb60c61dbb7456f024f9338c739b02be68e3f545c',
        '0x9bdb521a97e95177bf252c253e256a60c3e14447',
        '0x6914fc70fac4cab20a8922e900c4ba57feecf8e1',
        '0xa75ede99f376dd47f3993bc77037f61b5737c6ea',
    ]
  },
  avax: {
    owners: [
        '0xb60c61dbb7456f024f9338c739b02be68e3f545c',
        '0x9bdb521a97e95177bf252c253e256a60c3e14447',
        '0x6914fc70fac4cab20a8922e900c4ba57feecf8e1',
        '0xa75ede99f376dd47f3993bc77037f61b5737c6ea',
    ]
  },
  optimism: {
    owners: [
        '0x7344e478574acbe6dac9de1077430139e17eec3d',
        '0x6914fc70fac4cab20a8922e900c4ba57feecf8e1',
    ]
  },
  arbitrum: {
    owners: [
        '0x6914fc70fac4cab20a8922e900c4ba57feecf8e1',
    ]
  }
}

module.exports = cexExports(config)
module.exports.methodology = 'We are not counting money in defi Protocols. In this case around $1.49m in AAVE (Ethereum and polygon network), around $2.4m into notional (Ethereum network), around $660k into beethoven (Fantom network), around $130k into Harvest (BSC chain). We may also not counting a few small token balances. This data was collected on 14/01/2023 '