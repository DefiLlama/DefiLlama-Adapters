const { sumTokens2 } = require("../helper/unwrapLPs")

const contracts = [
  "0x2F123cF3F37CE3328CC9B5b8415f9EC5109b45e7", // bC3M
  "0x2f11eeee0bf21e7661a22dbbbb9068f4ad191b86", // bNIU
  "0x0f76D32CDccDcbd602A55Af23EAF58FD1eE17245", // bERNA
  "0xbbcb0356bB9e6B3Faa5CbF9E5F36185d53403Ac9", // bCOIN
  "0xCA30c93B02514f86d5C86a6e375E3A330B435Fb5", // b1B01
  "0x52d134c6DB5889FaD3542A09eAf7Aa90C0fdf9E4", // bIBTA
  "0x1e2c4fb7ede391d116e6b41cd0608260e8801d59", // bCSPX
  "0x20C64dEE8FdA5269A78f2D5BDBa861CA1d83DF7a", // bHIGH
  "0x3f95AA88dDbB7D9D484aa3D482bf0a80009c52c9", // bERNX
  "0xAde6057FcAfa57d6d51FFa341C64ce4814995995", // bZPR1
].map(i => i.toLowerCase())

const blacklistedOwners = [
  '0x5F7A4c11bde4f218f0025Ef444c369d838ffa2aD', // working capital
  '0x43624c744A4AF40754ab19b00b6f681Ca56F1E5b', // treasury/cold wallet
]
							
async function tvl(api) {
  let tokens = [...contracts]
  if (api.chain === 'base') {
    tokens.push('0xC3cE78B037DDA1B966D31EC7979d3f3a38571A8E')
    tokens = tokens.filter(i => i !== '0x1e2c4fb7ede391d116e6b41cd0608260e8801d59')
  }
  const supply = await api.multiCall({ abi: 'erc20:totalSupply', calls: tokens })
  const balances = {}
  await sumTokens2({ api, tokens, owners: blacklistedOwners, balances, transformAddress: i => i})
  Object.entries(balances).forEach(([token, bal]) => {
    api.add(token, bal * -1)
  })

  api.addTokens(tokens, supply)
  return api.getBalances()
}

const chains = ["ethereum", "polygon", 'xdai', 'bsc', "avax", "fantom", "base", "arbitrum"]

chains.forEach(chain => {
  module.exports[chain] = { tvl }
})