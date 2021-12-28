const {usdCompoundExports} = require('./helper/compound');

const contracts = {
  ethereum: {
    comptroller: '0x0C8c1ab017c3C0c8A48dD9F1DB2F59022D190f0b',
    gas:{
      pToken:"0x27A94869341838D5783368a8503FdA5fbCd7987c",
      decimals:18,
    },
  },
  okexchain: {
    comptroller: '0xaa87715e858b482931eb2f6f92e504571588390b',
    gas:{
      pToken:"0x621ce6596e0b9ccf635316bfe7fdbc80c3029bec",
      decimals:18,
    },
  },
  bsc: {
    comptroller: '0x8c925623708A94c7DE98a8e83e8200259fF716E0',
    gas:{
      pToken:"0x33A32f0ad4AA704e28C93eD8Ffa61d50d51622a7",
      decimals:18,
    },
  },
  polygon: {
    comptroller: '0xFfceAcfD39117030314A07b2C86dA36E51787948',
    gas:{
      pToken:"0xC1B02E52e9512519EDF99671931772E452fb4399",
      decimals:18,
    },
  },
  heco: {
    comptroller: '0x3401D01E31BB6DefcFc7410c312C0181E19b9dd5',
    gas:{
      pToken:"0x75DCd2536a5f414B8F90Bb7F2F3c015a26dc8c79",
      decimals:18,
    },
  },
  arbitrum: {
    comptroller: '0xaa87715E858b482931eB2f6f92E504571588390b',
    gas:{
      pToken:"0x17933112E9780aBd0F27f2B7d9ddA9E840D43159",
      decimals:18,
    },
  },
  optimism: {
    comptroller: '0x896aecb9E73Bf21C50855B7874729596d0e511CB',
    gas:{
      pToken:"0x8e1e582879Cb8baC6283368e8ede458B63F499a5",
      decimals:18,
    },
  },
  moonriver: {
    comptroller: '0x9a9b2bF1d1c96332C55d0B6aCb8C2B441381116d',
    gas:{
      pToken:"0x621CE6596E0B9CcF635316BFE7FdBC80C3029Bec",
      decimals:18,
    },
  },
};

const chainExports = {}
Object.entries(contracts).forEach(([chain, chainData])=>{
  chainExports[chain]=usdCompoundExports(chainData.comptroller, chain, chainData.gas.pToken)
})

module.exports={
  timetravel: true,
  ...chainExports,
  methodology: `TVL is comprised of tokens deposited to the protocol as collateral, similar to Compound Finance and other lending protocols the borrowed tokens are not counted as TVL.`
};
