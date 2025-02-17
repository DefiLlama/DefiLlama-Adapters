const { sumUnknownTokens } = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')

const Scientist = '0xEbB15456C0833033f0310f61748CD597554460Da';
const Transmute = '0x2dfE725eca8FFe13fe4E4a8E015cF857b3b72bcF';
const TransmuteAdapter = '0xa96b313cB2E81505b306250946e3Be86b26706B1';
const Farm = '0x68145F3319F819b8E01Dfa3c094fa8205E9EfB9a';
const VotingEscrow = '0xF92aBA2A79dC133278DE2CDDB38Db775A4b5B024';

// Token
const ibALPACA = "0xf1be8ecc990cbcb90e166b71e368299f0116d421";
const scUSD = "0x0E5C2b15666EEE4b66788E45CF4Da0392C070fa7";
const SCIX = "0x2CFC48CdFea0678137854F010b5390c5144C0Aa5";
const ScixBusd = "0xe8Efb51E051B08614DF535EE192B0672627BDbF9";
const scUsdBusd = "0x53085B02955CFD2F884c58D19B8a35ef5095E8aE";

module.exports = {
  bsc: {
    tvl,
    staking: staking(VotingEscrow, SCIX),
    pool2,
  },
};

async function tvl(api) {
  const totalDeposited = await api.call({  abi: 'uint256:totalDeposited', target: Scientist})
  const token = await api.call({  abi: 'address:token', target: Scientist})
  const scSupply = await api.call({  abi: 'address:totalSupplyScTokens', target: Transmute})
  // const transmuteValue = await api.call({  abi: 'address:totalValue', target: TransmuteAdapter})
  api.add(token, totalDeposited)
  api.add(token, scSupply)
  // api.add(token, transmuteValue)
  await api.sumTokens({ owner: Transmute, token})
}

async function pool2(api) {
  const ibALPACABalance = await api.call({  abi: 'erc20:balanceOf', target: ibALPACA, params: [Farm]})
  const ibALPACASupply = await api.call({  abi: 'uint256:totalSupply', target: ibALPACA})
  const alpacaBal = await api.call({  abi: 'uint256:totalToken', target: ibALPACA})
  const alpacaToken = await api.call({  abi: 'address:token', target: ibALPACA})
  api.add(alpacaToken, alpacaBal * ibALPACABalance / ibALPACASupply)

  return sumUnknownTokens({ api, useDefaultCoreAssets: true, resolveLP: true, owner: Farm, tokens: ['0xe8Efb51E051B08614DF535EE192B0672627BDbF9', '0x53085B02955CFD2F884c58D19B8a35ef5095E8aE', ScixBusd,scUsdBusd ] })
}