const sdk = require("@defillama/sdk");
const axios = require("axios");
const { transformBscAddress, transformAvaxAddress, transformPolygonAddress, transformHecoAddress } = require("../helper/portedTokens");

const networks = [
  1,
  56,
  43114,
  1029,
  137,
  25,
  128,
  106
];
const networkNames = {
  1: 'ethereum',
  56: 'bsc',
  43114: 'avax',
  1029: 'conflux',
  137: 'polygon',
  25: 'cronos',
  128: 'heco',
  106: 'velas'
};
const networkHex = {
  1: '0x1',
  56: '0x38',
  43114: '0xa86a',
  1029: '0x405',
  137: '0x89',
  25: '0x19',
  128: '0x80',
  106: '0x6a'
};

const vaults = {
  1: [
    "0xc77aab3c6d7dab46248f3cc3033c856171878bd5",
    "0xdbf72370021babafbceb05ab10f99ad275c6220a",
    "0xe2fe530c047f2d85298b07d9333c05737f1435fb"
  ],
  56: [
    "0x7536592bb74b5d62eb82e8b93b17eed4eed9a85c",
    "0x0c89c0407775dd89b12918b9c0aa42bf96518820"
  ],
  43114: [
    "0x88ada02f6fce2f1a833cd9b4999d62a7ebb70367",
    "0xe2fe530c047f2d85298b07d9333c05737f1435fb"
  ],
  1029: [
    "cfx:acdpej050fcr67a9epm21b0ew7jp5mgm7ub41unzne"
  ],
  137: [
    "0x586c21a779c24efd2a8af33c9f7df2a2ea9af55c",
    "0x3eF7442dF454bA6b7C1deEc8DdF29Cfb2d6e56c7"
  ],
  25: [
    "0x05b711Df32d73ECaa877d45a637a2eB415e7995f"
  ],
  128: [
    "0x4636668B5404e6D5cb7737B6C7f27691B0e27933",
    "0xE843f3BB9D63F9bB340aBE68da3CC03307e7Eb05"
  ],
  106: [
    "0x586c21A779C24eFd2a8aF33C9F7Df2a2EA9aF55c",
  ]
}

const getTVL = async (timestamp, ethBlock, chainBlocks, networkIndex = 0) => {
  const balances = {};
  try {
    let response = await axios.get(
      `https://teamfinance-public.herokuapp.com/api/wallet?network=${networkHex[networks[networkIndex]]}`
    )
    const addresses = response.data;
    let targetArr = [];
    for (let index = 0; index < vaults[networks[networkIndex]].length; index++) {
      const vaultAddress = vaults[networks[networkIndex]][index];
      let tempArray = addresses.map((tokenData) => ({
        target: tokenData.token,
        params: [vaultAddress],
      }));
      targetArr = targetArr.concat(tempArray);
    }

    const tokenTvls = await sdk.api.abi.multiCall({
      calls: targetArr,
      abi: 'erc20:balanceOf',
      chain: networkNames[networks[networkIndex]],
      block: chainBlocks[networkNames[networks[networkIndex]]]
    });
    let transform = a=>a;
    if (networkIndex === 1) {
      transform = await transformBscAddress();
    }
    if (networkIndex === 2) {
      transform = await transformAvaxAddress();
    }
    if (networkIndex === 3) {
      transform = a=>a;
      // Conflux
    }
    if (networkIndex === 4) {
      transform = await transformPolygonAddress();
    }
    if (networkIndex === 5) {
      transform = a=>a;
      // Cronos
    }
    if (networkIndex === 6) {
      transform = await transformHecoAddress();
    }
    if (networkIndex === 7) {
      transform = a=>a;
      // Velas
    }
    sdk.util.sumMultiBalanceOf(balances, tokenTvls, false, transform);
  } catch (error) {
    //
  }
  return balances;
};

module.exports = {
  // conflux: {
  //   tvl: (timestamp, ethBlock, chainBlocks) => getTVL(timestamp, ethBlock, chainBlocks, 3),
  // },
  // cronos: {
  //   tvl: (timestamp, ethBlock, chainBlocks) => getTVL(timestamp, ethBlock, chainBlocks, 5),
  // },
  // velas: {
  //   tvl: (timestamp, ethBlock, chainBlocks) => getTVL(timestamp, ethBlock, chainBlocks, 7),
  // },
  heco: {
    tvl: (timestamp, ethBlock, chainBlocks) => getTVL(timestamp, ethBlock, chainBlocks, 6),
  },
  ethereum: {
    tvl: (timestamp, ethBlock, chainBlocks) => getTVL(timestamp, ethBlock, chainBlocks, 0),
  },
  bsc: {
    tvl: (timestamp, ethBlock, chainBlocks) => getTVL(timestamp, ethBlock, chainBlocks, 1),
  },
  polygon: {
    tvl: (timestamp, ethBlock, chainBlocks) => getTVL(timestamp, ethBlock, chainBlocks, 4),
  },
  avalanche: {
    tvl: (timestamp, ethBlock, chainBlocks) => getTVL(timestamp, ethBlock, chainBlocks, 2),
  },
};
