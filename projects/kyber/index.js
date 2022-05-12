const { calcTvl } = require('./tvl.js')
const { transformAvaxAddress, fixAvaxBalances, transformFantomAddress, transformArbitrumAddress, getChainTransform } = require('../helper/portedTokens');
const { getBlock } = require('../helper/getBlock');

// tracking TVL for Kyber Network
  
  // tracking TVL for KyberDMM ethereum
   async function ethDmmTVL(timestamp, ethBlock, chainBlocks) {
    return calcTvl(addr => `ethereum:${addr}`, ethBlock, 'ethereum', '0x833e4083B7ae46CeA85695c4f7ed25CDAd8886dE', 0, true);
  }
  // tracking TVL for KyberDMM polygon
  async function polyTVL(timestamp, ethBlock, chainBlocks) {
    return calcTvl(addr => `polygon:${addr}`, chainBlocks['polygon'], 'polygon', '0x5F1fe642060B5B9658C15721Ea22E982643c095c', 0, true);
  }
  // tracking TVL for KyberDMM BSC
  async function bscTVL(timestamp, ethBlock, chainBlocks) {
    return calcTvl(addr => `bsc:${addr}`, chainBlocks['bsc'], 'bsc', "0x878dFE971d44e9122048308301F540910Bbd934c", 0, true);
  }
  // tracking TVL for KyberDMM Avalanche
  async function avaxTVL(timestamp, ethBlock, chainBlocks) {
    const transform = await transformAvaxAddress()
    const balances = await calcTvl(transform, chainBlocks['avax'], 'avax', "0x10908C875D865C66f271F5d3949848971c9595C9", 0, true);
    fixAvaxBalances(balances)
    return balances
  }
  // tracking TVL for KyberDMM Fantom
  async function ftmTVL(timestamp, ethBlock, chainBlocks) {
    const transform = await transformFantomAddress()
    return calcTvl(transform, chainBlocks['fantom'], 'fantom', '0x78df70615ffc8066cc0887917f2Cd72092C86409', 0, true);
  }
  // tracking TVL for KyberDMM Cronos
  async function croTVL(timestamp, ethBlock, chainBlocks) {
    return calcTvl(addr => `cronos:${addr}`, chainBlocks['cronos'], 'cronos', '0xD9bfE9979e9CA4b2fe84bA5d4Cf963bBcB376974', 0, true);
  }
  // tracking TVL for KyberDMM Aurora
  async function aurTVL(timestamp, ethBlock, chainBlocks) {
    return calcTvl(addr => `aurora:${addr}`, chainBlocks['aurora'], 'aurora', '0xD9bfE9979e9CA4b2fe84bA5d4Cf963bBcB376974', 0, true);
  }
  // tracking TVL for KyberDMM Velas
  async function vlsTVL(timestamp, block, chainBlocks) {
    block = await getBlock(timestamp, 'velas', chainBlocks)
    return calcTvl(addr => `velas:${addr}`, block, 'velas', '0xD9bfE9979e9CA4b2fe84bA5d4Cf963bBcB376974', 0, true);
  }
  // tracking TVL for KyberDMM Arbitrum
  async function arbTVL(timestamp, ethBlock, chainBlocks) {
    const transform = await transformArbitrumAddress()
    return calcTvl(transform, chainBlocks['arbitrum'], 'arbitrum', '0x51E8D106C646cA58Caf32A47812e95887C071a62', 0, true);
  }
  // tracking TVL for KyberDMM Velas
  async function oasisTVL(timestamp, ethBlock, chainBlocks) {
    return calcTvl(await getChainTransform('oasis'), chainBlocks['oasis'], 'oasis', '0xD9bfE9979e9CA4b2fe84bA5d4Cf963bBcB376974', 0, true);
  }
  // node test.js projects/kyber/index.js
/*==================================================
  Exports
==================================================*/

  module.exports = {
    misrepresentedTokens: true,
    ethereum: {
      tvl: ethDmmTVL,
    },
    polygon: {
      tvl: polyTVL,
   },
    bsc: {
      tvl: bscTVL,
   },
   avalanche:{
     tvl: avaxTVL,
   },
   fantom:{
     tvl: ftmTVL
   },
   cronos:{
     tvl: croTVL
   },
   aurora:{
    tvl: aurTVL,
  },
  arbitrum:{
    tvl: arbTVL
  },
  // velas:{
  //   tvl: vlsTVL
  // },
  oasis:{
    tvl: oasisTVL
  },
  };
