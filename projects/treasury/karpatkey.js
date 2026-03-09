const { karpatKeyTvl } = require('../helper/karpatkey');

module.exports={
    ethereum:{
      tvl: async (api)=>karpatKeyTvl(api, "karpatkey DAO", ""),
    }
  }