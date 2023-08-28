const { gmxExports } = require('../helper/gmx')
const perpsVault = "0x1785e8491e7e9d771b2A6E9E389c25265F06326A"
const chain = 'arbitrum'
const sdk = require('@defillama/sdk')
const { getDecimals } = require('../helper/utils')

const oracles = {
  "fxAUD": "0x9854e9a850e7c354c1de177ea953a6b1fba8fc22",
  "fxPHP": "0xff82aaf635645fd0bcc7b619c3f28004cdb58574",
  // "fxUSD": "0xd558Dd65583F7118F9ED921e8b94Ae3A295C83Bb",
  "fxEUR": "0xa14d53bc1f1c0f31b4aa3bd109344e5009051a84",
  "fxKRW": "0x85bb02e0ae286600d1c68bb6ce22cc998d411916",
  "fxCNY": "0xcc3370bde6afe51e1205a5038947b9836371eccb",
  "fxCHF": "0xe32accc8c4ec03f6e75bd3621bfc9fbb234e1fc3",
  "fxCAD": "0xf6da27749484843c4f02f5ad1378cee723dd61d4",
  "fxGBP": "0x9c4424fd84c6661f97d8d6b3fc3c1aac2bedd137",
  "fxJPY": "0x3dd6e51cb9cae717d5a8778cf79a04029f9cfdf8",
  "fxSGD": "0xf0d38324d1f86a176ac727a4b0c43c9f9d9c5eb1",
}

const fxTokens = {
  "fxAUD": "0x7E141940932E3D13bfa54B224cb4a16510519308",
  "fxPHP": "0x3d147cD9aC957B2a5F968dE9d1c6B9d0872286a0",
  // "fxUSD": "0x8616E8EA83f048ab9A5eC513c9412Dd2993bcE3F",
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
    tvl: async (_, _b, cb, { api }) => {
      const fxConfig = []
      const tokens = []

      Object.entries(fxTokens).forEach(([key, token]) => {
        tokens.push(token)
        if (!oracles[key]) throw new Error('Missing oracle')
        const label = `${chain}:${token.toLowerCase()}`
        fxConfig.push({ token, label, oracle: oracles[key] })
      })
      const balances = await(gmxExports({ vault: perpsVault, })(_, _b, cb, { api }))
      const block = cb[chain]
      const calls = fxConfig.map(i => ({ target: i.oracle }))
      const { output: price } = await sdk.api.abi.multiCall({
        abi: abis.latestAnswer, calls, chain, block,
      })
      const { output: decimals } = await sdk.api.abi.multiCall({
        abi: 'erc20:decimals', calls, chain, block,
      })
      const tokenDecimals = await getDecimals(chain, tokens)
      const fxUSD = 'arbitrum:0x8616e8ea83f048ab9a5ec513c9412dd2993bce3f'
      if (balances[fxUSD]) {
        sdk.util.sumSingleBalance(balances, 'tether', balances[fxUSD]/1e18)
        delete balances[fxUSD]
      }

      fxConfig.forEach(({ label, token }, i) => {
        const bal = balances[label]
        if (!bal) return;
        delete balances[label]
        sdk.util.sumSingleBalance(balances, 'tether', price[i].output * bal / (10 ** (+decimals[i].output + +tokenDecimals[token] )))
      })
      return balances
    }
  },
};

const abis = {
  latestAnswer: "int256:latestAnswer"
}