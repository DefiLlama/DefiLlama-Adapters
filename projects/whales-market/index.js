const ADDRESSES = require('../helper/coreAssets.json');
const {  sumTokens2 } = require("../helper/solana");
const { sumTokensExport  } = require('../helper/sumTokens')

const insuranceConfig = {
      ethereum: {
        owner: '0x1eCdB32e59e948C010a189a0798C674a2d0c6603',
        tokens: [ADDRESSES.null, ADDRESSES.ethereum.USDT, ADDRESSES.ethereum.USDC],
      },
      arbitrum: {
        owner: '0x7a560269480ef38b885526c8bbecdc4686d8bf7a',
        tokens: [ADDRESSES.null,ADDRESSES.arbitrum.USDC],
      },
      merlin: {
        owner: '0x7a560269480ef38b885526c8bbecdc4686d8bf7a',
        tokens: [ADDRESSES.null],
      },
      manta: {
        owner: '0x7a560269480Ef38B885526C8bBecdc4686d8bF7A',
        tokens: [ADDRESSES.null],
      },
      starknet: {
        owner: '0x04427a62f43314c0f1b171358235c04598dbc702c61a891fa1fb0cc52936cfff',
        tokens: [ADDRESSES.starknet.ETH, ADDRESSES.starknet.USDC, ADDRESSES.starknet.USDT],
      },
      blast: {
        owner: '0x7a560269480Ef38B885526C8bBecdc4686d8bF7A',
        tokens: [ADDRESSES.null],
      },
      base: {
        owner: '0xdf02eeaB3CdF6eFE6B7cf2EB3a354dCA92A23092',
        tokens: [ADDRESSES.null],
      },
      bsc: {
        owner: '0x7a560269480Ef38B885526C8bBecdc4686d8bF7A',
        tokens: [ADDRESSES.null],
      },
      linea: {
        owner: '0x7a560269480Ef38B885526C8bBecdc4686d8bF7A',
        tokens: [ADDRESSES.null],
      },
      mode: {
        owner: '0x7a560269480Ef38B885526C8bBecdc4686d8bF7A',
        tokens: [ADDRESSES.null],
      },
      solana: {
        owner: 'GDsMbTq82sYcxPRLdQ9RHL9ZLY3HNVpXjXtCnyxpb2rQ',
        tokens: [ 
            ADDRESSES.solana.USDC,
            ADDRESSES.solana.SOL,
            ADDRESSES.solana.USDT,
            'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn'// jito SOL
            ],
      },
      
}

async function tvl() {
      return sumTokens2({ owner: insuranceConfig.solana.owner, tokens: 
            insuranceConfig.solana.tokens
      });
}

module.exports = {
      ethereum: { tvl: sumTokensExport(insuranceConfig.ethereum)},
      arbitrum: { tvl: sumTokensExport(insuranceConfig.arbitrum)},
      merlin: { tvl:  sumTokensExport(insuranceConfig.merlin)},
      manta: { tvl:  sumTokensExport(insuranceConfig.manta)},
      blast: { tvl:  sumTokensExport(insuranceConfig.blast) },
      base: { tvl:  sumTokensExport(insuranceConfig.base) },
      bsc: { tvl:  sumTokensExport(insuranceConfig.bsc) },
      linea: { tvl:  sumTokensExport(insuranceConfig.linea) },
      mode: { tvl: sumTokensExport(insuranceConfig.mode) },
      solana: { tvl },
      starknet: { tvl: sumTokensExport(insuranceConfig.starknet)},
};
