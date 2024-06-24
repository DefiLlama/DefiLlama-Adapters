const { nullAddress } = require("../helper/tokenMapping");
const { sumTokensExport } = require("../helper/unwrapLPs");

const BSC_POOL_CONTRACT = '0xB1FcDb8Ed3c2Bc572440b08a5A93984f366BBf3C';
const BLAST_POOL_CONTRACT = '0x4E927c4bc1432dc7608d2199a77e630cc1676eD7';
const BASE_POOL_CONTRACT = '0x35a7E7f5A8ECe30585364c28EE5974E3ECe375DC';
const MODE_POOL_CONTRACT = '0xbADaC8BDFdC6Ef7be408e94AbE3ddC6bec783E59';

module.exports = {
  methodology: 'counts the number of BNB and ETH tokens in the bsc, blast, base and mode pool contracts.',
  bsc: {
    tvl: sumTokensExport({ owner: BSC_POOL_CONTRACT, tokens: [nullAddress], })
  },
  blast: {
    tvl: sumTokensExport({ owner: BLAST_POOL_CONTRACT, tokens: [nullAddress], })
  },
  base: {
    tvl: sumTokensExport({ owner: BASE_POOL_CONTRACT, tokens: [nullAddress], })
  },
  mode: {
    tvl: sumTokensExport({ owner: MODE_POOL_CONTRACT, tokens: [nullAddress], })
  },
}