const sdk = require('@defillama/sdk');
const _ = require('underscore');
const { getChainTransform } = require("../helper/portedTokens");
const { unwrapYearn } = require('../helper/unwrapLPs')

const abi = { 
  "constant": true, 
  "inputs": [], 
  "name": "exchangeRateStored", 
  "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], 
  "payable": false, 
  "stateMutability": "view", 
  "type": "function" 
};

const cLINK = '0xface851a4921ce59e912d19329929ce6da6eb0c7';

const yvTokens = [
  '0x637ec617c86d24e421328e6caea1d92114892439',
  '0x0a0b23d9786963de69cb2447dc125c49929419d8',
  '0xef0210eb96c7eb36af8ed1c20306462764935607',
  '0x0dec85e74a92c52b7f708c4b10207d9560cefaf0',
  '0x2c850cced00ce2b14aa9d658b7cad5df659493db'
];

async function getTokenHolderList(chain) {
  if (chain === 'ethereum') {
    return {
      tokenList: [
        '0x39aa39c021dfbae8fac545936693ac917d5e7563',
        '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
        '0x0AeE8703D34DD9aE107386d3eFF22AE75Dd616D1',
        '0xccf4429db6322d5c611ee964527d42e5d685dd6a',
        '0xface851a4921ce59e912d19329929ce6da6eb0c7'
      ],
      holderList: [
        '0x05060F5ab3e7A98E180B418A96fFc82A85b115e7',
        '0xAB4235a9ACf00A45557E90F7dB127f3b293cA45A'
      ]
    }
  } else if (chain === 'fantom') {
    return {
      tokenList: [
        "0x637ec617c86d24e421328e6caea1d92114892439", 
        "0x0a0b23d9786963de69cb2447dc125c49929419d8", 
        "0xef0210eb96c7eb36af8ed1c20306462764935607",
        "0x0dec85e74a92c52b7f708c4b10207d9560cefaf0", 
        "0x2c850cced00ce2b14aa9d658b7cad5df659493db"
      ],
      holderList: [
        "0xe572401aFa7405Ea8EBf657D2b2Ed0Bce0bCf288"
      ]
    }
  } else if (chain === 'avax') {
    return {
      holderList: [
        "0x50F0C239f51d470BFDEb2E76E0E76D4344D89D6B"
      ],
      tokenList: [
        "0xd45b7c061016102f9fa220502908f2c0f1add1d7", 
        "0x47afa96cdc9fab46904a55a6ad4bf6660b53c38a", 
        "0x46a51127c3ce23fb7ab1de06226147f446e4a857",
        "0x532e6537fea298397212f09a61e03311686f548e", 
        "0xdfe521292ece2a4f44242efbcd66bc594ca9714b",
        "0x686bef2417b6dc32c50a3cbfbcc3bb60e1e9a15d", 
        "0x53f7c5869a859f0aec3d334ee8b4cf01e3492f21"
      ]
    }
  } else if (chain === 'polygon') {
    return {
      holderList: [
        "0x03f44E563dD447449F48f8103b5dF70aFf7CF577"
      ],
      tokenList: [
        "0x1a13f4ca1d028320a707d99520abfefca3998b7f", 
        "0x8df3aad3a84da6b69a4da8aec3ea40d9091b2ac4", 
        "0x27f8d03b3a2196956ed754badc28d73be8830a6e"
      ]
    }
  }
};
async function polygonTvl(timestamp, ethBlock, chainBlocks) {
  let chain = 'polygon';
  let { tokenList, holderList } = await getTokenHolderList(chain)
  return tvl(timestamp, chainBlocks.polygon, chain, tokenList, holderList);
};
async function ethTvl(timestamp, ethBlock, chainBlocks) {
  let chain = 'ethereum';
  let { tokenList, holderList } = await getTokenHolderList(chain)
  return tvl(timestamp, ethBlock, chain, tokenList, holderList);
};
async function ftmTvl(timestamp, ethBlock, chainBlocks) {
  let chain = 'fantom';
  let { tokenList, holderList } = await getTokenHolderList(chain)
  return tvl(timestamp, chainBlocks.fantom, chain, tokenList, holderList);
};
async function avaxTvl(timestamp, ethBlock, chainBlocks) {
  let chain = 'avax';
  let { tokenList, holderList } = await getTokenHolderList(chain)
  return tvl(timestamp, chainBlocks.avax, chain, tokenList, holderList);
};
async function tvl(timestamp, block, chain, tokenList, holderList) {
  const transform = await getChainTransform(chain);
  const balances = {};
  const calls = [];

  _.each(tokenList, (token) => {
    _.each(holderList, (contract) => {
      calls.push({
        target: token,
        params: contract
      })
    })
  });

  const balanceOfResults = (await sdk.api.abi.multiCall({
    block,
    calls,
    abi: 'erc20:balanceOf',
    chain
  })).output;

  for (let i = 0; i < balanceOfResults.length; i++) {
    await sdk.util.sumSingleBalance(
      balances, 
      transform(balanceOfResults[i].input.target), 
      balanceOfResults[i].output
    );

    if (yvTokens.includes(balanceOfResults[i].input.target)) {
      await unwrapYearn(
        balances, 
        balanceOfResults[i].input.target, 
        block, 
        chain, 
        transform
      );
    };
  };

  if (cLINK in balances) {
    const exchangeRate = (await sdk.api.abi.call({
      block,
      target: cLINK,
      abi,
      chain
    })).output;

    balances['0x514910771af9ca656af840dff83e8264ecf986ca'] = 
      balances[cLINK] * (exchangeRate / 10 ** 28);
    delete balances[cLINK];
  };

  return balances;
};

module.exports = {
  start: 1621340071,
  ethereum: {
    tvl: ethTvl
  },
  fantom: {
    tvl: ftmTvl
  },
  avax: {
    tvl: avaxTvl
  },
  polygon: {
    tvl: polygonTvl
  }
};