const Abis = require("./abi.json");
const { sumTokensExport, sumUnknownTokens, } = require('../helper/unknownTokens')

const Contracts = {
  bsc: {
    wbnb: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    brx: "0xe550c560a895d043E5EEd2bC7eC8A8e46c2408D6",
    fossil: "0xfE8FFB60a2B6d46102caa35739Be465E600D0f5E",
    bank: "0xF90c0b409001b97067c539693754008456f6C265",
    multiFeeDistribution: "0xd1f2467b2E2cb7bABc5CE8a947A294f216D93F90",
    chef: "0xF59e1568cb5FA1cdf1f4233D738D802A90c64B5E",
    lps: [
      "0x9bB50fE7E33C15405f94978A5bb88F8544847007", // FOSSIL_BNB_LP
      "0x5Ff686208DFe12D35761fe9C74396852303BC377", // BRX_BNB_LP
    ],
  },
};

async function calcBscStakingTvl(timestamp, ethBlock, chainBlocks,  {api}) {
  const bscStakingData = await api.call({    target: Contracts.bsc.multiFeeDistribution,    abi: Abis.multiFeeDistribution.totalSupply,  });
  api.add(Contracts.bsc.fossil, bscStakingData)
  return sumUnknownTokens({ api, useDefaultCoreAssets: true, lps: Contracts.bsc.lps, })
}

module.exports = {
  bsc: {
    tvl: sumTokensExport({ owner: Contracts.bsc.bank, tokens: [Contracts.bsc.wbnb] }),
    pool2: sumTokensExport({ owner: Contracts.bsc.chef, tokens: Contracts.bsc.lps, useDefaultCoreAssets: true,  }),
    staking: calcBscStakingTvl,
  },
};