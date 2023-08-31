const swapContractV1 = '0x84c18204c30da662562b7a2c79397C9E05f942f0';
const swapContractV2 = '0x2a98158166BE71D21Dd97e248ba670211Df9a73C';
const futureContract = '0x57D28e11Cb2f72812A9f9DA72F2Ff868cd4B43F2';
const osd='0x2F96F4397AdDdF9C2eeB5233a29556BE26eb9450';
const oeth='0x9D8A2817eb7137021E2F1A86316a7E3A3351b4e0';

const baseSwapContract = '0xdDc8Bd03c1AB16a3E3dB0E89AA32C238FB9d63de';
const baseFutureContract = '0xdDc8Bd03c1AB16a3E3dB0E89AA32C238FB9d63de';
const baseOsd='0x139f18aC2a9FA34E0225FD2AAE983fc969b35540';
const baseOEth='0x2a86F14E762622Da8B7FB2A5BBdE50E16936279f';

const { sumTokens2 } = require('../helper/unwrapLPs')

async function EraTvl(timestamp, ethBlock, chainBlocks, { api }) {
  const v1tokens = await api.call({ target: swapContractV1, abi: 'function getPoolTokenList() external view returns (address[])', });
  const v2tokens = await api.call({ target: swapContractV2, abi: 'function getPoolTokenList() external view returns (address[])', });
  return sumTokens2({ api,tokens:[...v1tokens,...v2tokens,osd,oeth],owners:[swapContractV1,swapContractV2,futureContract]})  
}

async function BaseTvl(timestamp, ethBlock, chainBlocks, { api }) {
  const tokens = await api.call({ target: baseSwapContract, abi: 'function getPoolTokenList() external view returns (address[])', });
  return sumTokens2({ api, tokens:[...tokens,baseOsd,baseOEth], owners: [baseSwapContract,baseFutureContract], })
}

module.exports = {
  era: {
    tvl:EraTvl
  },
  base:{
    tvl:BaseTvl
  }
};