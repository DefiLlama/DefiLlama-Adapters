const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Counts all assets that are deposited in all vaults curated by Yearn.',
  blockchains: {
    ethereum: {
      morphoVaultOwners: [
        '0xFc5F89d29CCaa86e5410a7ad9D9d280d4455C12B',
      ],
      turtleclub_erc4626: [
        '0xF470EB50B4a60c9b069F7Fd6032532B8F5cC014d',
        '0xA5DaB32DbE68E6fa784e1e50e4f620a0477D3896',
        '0xe1Ac97e2616Ad80f69f705ff007A4bbb3655544a',
        '0x77570CfEcf83bc6bB08E2cD9e8537aeA9F97eA2F',
      ],
    },
    base: {
      morphoVaultOwners: [
        '0xFc5F89d29CCaa86e5410a7ad9D9d280d4455C12B',
        '0x50b75d586929ab2f75dc15f07e1b921b7c4ba8fa',
      ],
    },
    katana: {
      morphoVaultOwners: [
        '0xFc5F89d29CCaa86e5410a7ad9D9d280d4455C12B',
        '0x518C21DC88D9780c0A1Be566433c571461A70149',
      ],
      // ausd: [  // already counted as part of yearn
      //   '0x93Fec6639717b6215A48E5a72a162C50DCC40d68'
      // ],
      // morphoSushi: [
      //   '0x9A6bd7B6Fd5C4F87eb66356441502fc7dCdd185B',
      //   '0x8Fb1c10Ad4417EcA341a1D903Ff437d25ff87a4e',
      //   '0xAa0362eCC584B985056E47812931270b99C91f9d',
      //   '0x80c34BD3A3569E126e7055831036aa7b212cB159',
      //   '0xE007CA01894c863d7898045ed5A3B4Abf0b18f37',
      // ],
    },
    arbitrum: {
      morphoVaultOwners: [
        '0xFc5F89d29CCaa86e5410a7ad9D9d280d4455C12B',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
