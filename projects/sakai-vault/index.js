const utils = require('../helper/utils');

const contracts  = {
    "SAKAI": "0x43b35e89d15b91162dea1c51133c4c93bdd1c4af",
    "Sakai-SP": "0xc20A079c7962D9fc92173cda349e80D484dFA42A" //Sakai Staking Protocol Contract
};


async function fetch() {
    const response = await utils.fetchURL("https://lp.sakaivault.io/tvl"); 
    const tvl = await response.data //Check locked value : https://app.sakaivault.io/
    const lastIndex = await tvl[tvl.length-1]
    return {...lastIndex}
  }
  
  module.exports = {
    fetch,
  };
  