const { cexExports } = require('../helper/cex')

const config = {
  bitcoin: {
    owners: [
      'bc1qpy4jwethqenp4r7hqls660wy8287vw0my32lmy',
      '3LhhDLBVWBZChNQv8Dn4nDKFnCyojG1FqN',
      '3QsGsAXQ4rqRNvh5pEW55hf3F9PEyb7rVq',
      'bc1qr4dl5wa7kl8yu792dceg9z5knl2gkn220lk7a9',
      'bc1q4c8n5t00jmj8temxdgcc3t32nkg2wjwz24lywv',
      '14m3sd9HCCFJW4LymahJCKMabAxTK4DAqW',
      'bc1qjqy709gqpse60hdsm2d2v0dzzu7yp5dej7fdrpl2x3taccvujq4s0vzsyd',
      'bc1qcdqj2smprre85c78d942wx5tauw5n7uw92r7wr'
    ],
  },
  ethereum: {
    owners: [
      '0x72a53cdbbcc1b9efa39c834a540550e23463aacb',
      '0x6262998ced04146fa42253a5c0af90ca02dfd2a3',
      '0xcffad3200574698b78f32232aa9d63eabd290703',
      '0x7758e507850da48cd47df1fb5f875c23e3340c50',
      '0x46340b20830761efd32832a74d7169b29feb9758',
      '0xf3b0073e3a7f747c7a38b36b805247b222c302a3',
    ],
  },
  bsc: {
    owners: [
              '0x72A53cDBBcc1b9efa39c834A540550e23463AAcB',
              '0xcffad3200574698b78f32232aa9d63eabd290703',
              '0x7758e507850da48cd47df1fb5f875c23e3340c50',
              '0xcffad3200574698b78f32232aa9d63eabd290703'
            ]
  },
  polygon: {
    owners: [
              '0x72A53cDBBcc1b9efa39c834A540550e23463AAcB',
              '0xcffad3200574698b78f32232aa9d63eabd290703',
              '0x6262998Ced04146fA42253a5C0AF90CA02dfd2A3',
              '0x7758e507850da48cd47df1fb5f875c23e3340c50',
              '0xcffad3200574698b78f32232aa9d63eabd290703'
            ]
  },
  arbitrum: {
    owners: [
              '0xcffad3200574698b78f32232aa9d63eabd290703',
              '0x6262998Ced04146fA42253a5C0AF90CA02dfd2A3',
              '0x72A53cDBBcc1b9efa39c834A540550e23463AAcB',
              '0x7758e507850da48cd47df1fb5f875c23e3340c50',
              '0xcffad3200574698b78f32232aa9d63eabd290703'
            ]
  },
  avax: {
    owners: [
               '0xcffad3200574698b78f32232aa9d63eabd290703',
               '0x6262998Ced04146fA42253a5C0AF90CA02dfd2A3',
               '0x72A53cDBBcc1b9efa39c834A540550e23463AAcB',
               '0x7758e507850da48cd47df1fb5f875c23e3340c50',
               '0xcffad3200574698b78f32232aa9d63eabd290703'
            ]
  },
  optimism: {
    owners: [
               '0xcffad3200574698b78f32232aa9d63eabd290703',
               '0x6262998Ced04146fA42253a5C0AF90CA02dfd2A3',
               '0x72A53cDBBcc1b9efa39c834A540550e23463AAcB',
               '0x7758e507850da48cd47df1fb5f875c23e3340c50',
               '0xcffad3200574698b78f32232aa9d63eabd290703'
            ]
  },
  fantom: {
    owners: [
              '0x6262998Ced04146fA42253a5C0AF90CA02dfd2A3',
              '0x72A53cDBBcc1b9efa39c834A540550e23463AAcB',
              '0x7758e507850da48cd47df1fb5f875c23e3340c50',
              '0xcffad3200574698b78f32232aa9d63eabd290703'
            ]
  }
}

module.exports = cexExports(config)
