const { karpatKeyTvl } = require('../helper/karpatkey');

module.exports={
    ethereum:{
      tvl: async (timestamp)=>karpatKeyTvl(timestamp, "karpatkey DAO", ""),
    }
  }