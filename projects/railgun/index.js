const sdk = require('@defillama/sdk');
const abi = require('./ABI.json');
const { getTokens } = require('../helper/getTokens');
const { getChainTransform } = require('../helper/portedTokens');
const { sumTokens2 } = require('../helper/unwrapLPs')

const CONTRACTS = {
  ethereum: {
    STAKING: '0xee6a649aa3766bd117e12c161726b693a1b2ee20',
    RAIL: '0xe76C6c83af64e4C60245D8C7dE953DF673a7A33D',
    TREASURY: '0xE8A8B458BcD1Ececc6b6b58F80929b29cCecFF40',
    PROXY: '0xFA7093CDD9EE6932B4eb2c9e1cde7CE00B1FA4b9',
  },

  bsc: {
    STAKING: '0x753f0F9BA003DDA95eb9284533Cf5B0F19e441dc',
    RAIL: '0x3F847b01d4d498a293e3197B186356039eCd737F',
    TREASURY: '0x19B620929f97b7b990801496c3b361CA5dEf8C71',
    PROXY: '0x590162bf4b50F6576a459B75309eE21D92178A10',
  },

  polygon: {
    STAKING: '0x9AC2bA4bf7FaCB0bbB33447e5fF8f8D63B71dDC1',
    RAIL: '0x92A9C92C215092720C731c96D4Ff508c831a714f',
    TREASURY: '0x7C956dB76b4Bd483F96fcE6beA3615f263aFD333',
    PROXY: '0x19B620929f97b7b990801496c3b361CA5dEf8C71',
  },
};

function getTVLFunc(contractAddress, chain) {
  return async function (timestamp, _, { [chain]: block }) {
    const tokens = await getTokens(contractAddress, chain);
    return sumTokens2({ owner: contractAddress, tokens, blacklistedTokens: [CONTRACTS[chain].RAIL], chain, block, })
  }
}

function getStakingFunc(stackingContractAddress, chain) {
  return async function staking(timestamp, blockEth, { [chain]: block }) {
    const chainTransform = await getChainTransform(chain);
    const balances = {};

    const railAddress = chainTransform(CONTRACTS[chain].RAIL);
    const interval = await sdk.api.abi.call({
      target: stackingContractAddress,
      abi: abi['intervalAtTime'],
      params: timestamp,
      block: block,
      chain
    });

    const railTVL = await sdk.api.abi.call({
      target: stackingContractAddress,
      abi: abi['globalsSnapshotAt'],
      params: [interval.output, 0],
      block: block,
      chain
    });

    balances[railAddress] = railTVL.output.totalStaked;
    return balances;
  }
}

function getChainTVL(chain) {
  return {
    staking: getStakingFunc(CONTRACTS[chain].STAKING, chain),
    treasury: getTVLFunc(CONTRACTS[chain].TREASURY, chain),
    tvl: getTVLFunc(CONTRACTS[chain].PROXY, chain),
  };
}

module.exports = {
  ethereum: getChainTVL('ethereum'),
  bsc: getChainTVL('bsc'),
  polygon: getChainTVL('polygon'),
}

