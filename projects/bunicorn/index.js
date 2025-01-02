const sdk = require("@defillama/sdk");
const { v1Tvl } = require("../helper/balancer");
const { uniTvlExport } = require("../helper/unknownTokens");
const BUNI_CONTRACT_ADDRESS = "0x0e7beec376099429b85639eb3abe7cf22694ed49";
const MASTERCHEF_CONTRACT_ADDRESS = "0xA12c974fE40ea825E66615bA0Dc4Fd19be4D7d24";

async function staking(api) {
  return api.sumTokens({
    owner: MASTERCHEF_CONTRACT_ADDRESS,
    tokens: [BUNI_CONTRACT_ADDRESS],
  });
}

module.exports = {
  bsc: {
    tvl: sdk.util.sumChainTvls([v1Tvl('0x48ab312150E1802D57639859d7C3107aE751FE35', 8973039), uniTvlExport('bsc', '0x86873f85bc12ce40321340392c0ff39c3bdb8d68', {
      abis: {
        allPairsLength: 'uint256:allPoolsLength',
        allPairs: 'function allPools(uint256) view returns (address)',
      },
      fetchBalances: true, // get reserves call fails
    }).bsc.tvl]),
    staking,
  },
};
