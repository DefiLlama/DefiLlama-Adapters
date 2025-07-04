const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

const config = {
  core: '0xbEF63121a00916d88c4558F2a92f7d931C67115B',
  sonic: '0xbEF63121a00916d88c4558F2a92f7d931C67115B',
  sophon: '0x66Ae13488b281C0aCf731b8D7970E069b673df00',
  morph: '0x045AF95cAAbB5971183C411aBd7c81F2E122706D',
  celo: '0x797357F76042D76523848eF9ABb5e2e5c1aF1655',
  soneium: '0x1C0F98d9fE946d42f44196C439256BcfEe80B056',
  scroll: '0x809c2C530c35Dd0a8877e1EEf139fd60d9b811Eb',
  linea: '0xA74e55412Ffb46747dd45eeFdb68BF1366205036',
  taiko: '0x95e483Ce4acf1F24B6cBD8B369E0735a3e56f5BB',
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: sumTokensExport({ owner: config[chain], tokens: [nullAddress] })
  }
})