const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensExport } = require('../helper/sumTokens');
const { sumTokens2 } = require('../helper/unwrapLPs');
const { getConfig } = require('../helper/cache');

const defaultOwner = '0x6b0e12Cb3D78a931b74F51D09F3D34E3047c0E49'; // meson

const config = {
  merlin: {
    tokens: [
      '0xB880fd278198bd590252621d4CD071b1842E9Bcd', // M-BTC
      '0x93919784C523f39CACaa98Ee0a9d96c3F32b593e'  // uniBTC
    ],
  },
};

async function addCoinfg(id, ownerTokens) {
  const { result } = await getConfig('meson', 'https://relayer.meson.fi/api/v1/list');
  const { address, tokens } = result.find(c => c.id === id) ?? {};
  if (!address) return;
  ownerTokens.push([tokens.map(i => i.addr ?? ADDRESSES.null).filter(i => i), address]);
  return ownerTokens;
}

Object.keys(config).forEach(chain => {
  const { id = chain, owner = defaultOwner, tokens } = config[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      const ownerTokens = [];
      if (tokens) ownerTokens.push([tokens, owner]);
      await addCoinfg(id, ownerTokens);
      return sumTokens2({ api, ownerTokens });
    }
  };
});

module.exports = {
  methodology: "Summary of Dukchain staking assets",
  ton: {
    tvl: sumTokensExport({
      tokens: [
        ADDRESSES.null, // 用于追踪原生 TON
        "EQCuPm01HldiduQ55xaBF_1kaW_WAUy5DHey8suqzU_MAJOR",
        "EQAvlWFDxGF2lXm67y4yzC17wYKD9A0guwPkMs1gOsM__NOT",
        "EQCvxJy4eG8hyHBFsZ7eePxrRsUQSFE_jpptRAYBmcG_DOGS",
        "EQB4zZusHsbU2vVTPqjhlokIOoiZhEdCMT703CWEzhTOo__X",
        "EQAJ8uWd7EBqsmpSWaRdf_I-8R8-XHwh3gsNKhy-UrdrPcUo",
        "EQC98_qAmNEptUtPc7W6xdHh_ZHrBUFpw5Ft_IzNU20QAJav",
        "EQD-cvR0Nz6XAyRBvbhz-abTrRC6sI5tvHvvpeQraV9UAAD7",
        "EQAfF5j3JMIpZlLmACv7Ub7RH7WmiVMuV4ivcgNYHvNnqHTz"
      ],
      owners: [
        "UQABbkaGs-mjWe6ifQ2h11GOEdGRyAPNrZi41-MK1uX92ulc", // UTONIC Ton生态所有代币
        "EQCVarr_Agtk4A8_Sn5RO2M8QH9j5WQjdoN984P-b6TBZB8Z"  // UTONIC 多签
      ],
      onlyWhitelistedTokens: false
    })
  },
  ethereum: {
    tvl: sumTokensExport({
      ownerTokens: [
        [[ADDRESSES.null], "0xb4eE432B0fbb64CC5C4bbA74427436b5347E88A4"] // meson eth
      ],
    }),
  },
  arbitrum: {
    tvl: sumTokensExport({
      owners: ["0x5E8c3F0eA1d4004F32dFaE54bca88C78D065d869"],
      tokens: [ADDRESSES.arbitrum.WETH, ADDRESSES.arbitrum.USDT, ADDRESSES.arbitrum.USDC_CIRCLE,ADDRESSES.null,] // meson eth usdc and usdt 
    }),
  },
  merlin: { //meson merlin
    tvl: async (api) => {
      const ownerTokens = [];
      const { tokens } = config.merlin;
      if (tokens) ownerTokens.push([tokens, defaultOwner]);
      //await addCoinfg('merlin', ownerTokens);
      return sumTokens2({ api, ownerTokens });
    }
  },
};


// Excluding merlin tvl as it feels inorganic
delete module.exports.merlin