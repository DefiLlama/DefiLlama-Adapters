const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets deposited in all vaults curated by Sky Money.',
  blockchains: {
    ethereum: {
      morpho: [
        '0x23f5E9c35820f4baB695Ac1F19c203cC3f8e1e11',
        '0xE15fcC81118895b67b6647BBd393182dF44E11E0',
        '0x56bfa6f53669B836D1E0Dfa5e99706b12c373ecf',
        '0xf42bca228D9bd3e2F8EE65Fec3d21De1063882d4',
        '0x2bD3A43863c07B6A01581FADa0E1614ca5DF0E3d'
      ],
      
    },
    
  }
}

module.exports = getCuratorExport(configs)
