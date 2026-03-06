const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, } = require('../helper/unknownTokens')

const Contracts = {
  bsc: {
    shield: "0xD9E90DF21F4229249E8841580cDE7048bF935710",
    bank: "0xcc40896e6d0C8Dd93Bd9DFaF11118B338015EcD4",
    multiFeeDistribution: "0x36D7fa1C701aAA811F8736C40435C50Bb77BF843",
    chef: "0xd8d4bf1bcB9Db777188A20Ee458e9F560092644c",
    lps: [
      "0xA976a4ba5076f1264e0f8fFB5b9ff4aC9Fd615fa",  // SHIELD_BNB_LP
      "0xb5A343D746be5942B37e222678979F124ecE8f68",  // BNBX_BNB LP 
    ],
  },
};

async function staking(api) {
  const bal = await api.call({  abi: 'uint256:totalSupply', target: Contracts.bsc.multiFeeDistribution})
  api.add(Contracts.bsc.shield, bal)
}

module.exports = {
  bsc: {
    tvl: sumTokensExport({ owner: Contracts.bsc.bank, tokens: [ADDRESSES.bsc.WBNB] }),
    pool2: sumTokensExport({ owner: Contracts.bsc.chef, tokens: Contracts.bsc.lps, useDefaultCoreAssets: true, }),
    staking,
  },
};
