  const v1TVL = require('./v1');
  const v2TVL = require('./v2');

  async function tvl(api) {
    await v1TVL(api); 
    await v2TVL(api);
  }

  module.exports = {
    start: '2019-04-10',  // 04/09/2019 @ 10:29pm (UTC)
    ethereum: { tvl }
  }
