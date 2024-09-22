const sdk = require('@defillama/sdk')
const { aaveExports } = require("../helper/aave");

const config = {
  klaytn: ["0x3eFC37753ec2501b406F3443cFD8D406B52abEa6"],
};



const data = {};
Object.keys(config).forEach((chain) => {
  const chainExports = config[chain].map((address) => aaveExports(chain, undefined, undefined, [address],{v3:true}))
  data[chain] = {
    tvl: sdk.util.sumChainTvls(chainExports.map(i => i.tvl)),
    borrowed: sdk.util.sumChainTvls(chainExports.map(i => i.borrowed))
  }
});


module.exports = data;
