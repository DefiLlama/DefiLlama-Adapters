const { gmxExports } = require('../helper/gmx')
const perpsVault = "0x1785e8491e7e9d771b2A6E9E389c25265F06326A"

const fxTokens = {
  "fxAUD": "0x7E141940932E3D13bfa54B224cb4a16510519308",
  "fxPHP": "0x3d147cD9aC957B2a5F968dE9d1c6B9d0872286a0",
  "fxUSD": "0x8616E8EA83f048ab9A5eC513c9412Dd2993bcE3F",
  "fxEUR": "0x116172B2482c5dC3E6f445C16Ac13367aC3FCd35",
  "fxKRW": "0xF4E8BA79d058fFf263Fd043Ef50e1010c1BdF991",
  "fxCNY": "0x2C29daAce6Aa05e3b65743EFd61f8A2C448302a3",
  "fxCHF": "0x8C414cB8A9Af9F7B03673e93DF73c23C1aa05b4e",
  "fxCAD": "0x398B09b68AEC6C58e28aDe6147dAC2EcC6789737",
  "fxGBP": "0x1AE27D9068DaDf10f611367332D162d184ed3414",
  "fxJPY": "0x95e0e6230e9E965A4f12eDe5BA8238Aa04a85Bc6",
  "fxSGD": "0x55a90F0eB223f3B2C0C0759F375734C48220decB",
}

module.exports = {
  misrepresentedTokens: true,
  arbitrum: {
    tvl: gmxExports({ vault: perpsVault,blacklistedTokens: Object.values(fxTokens) })
  },
}