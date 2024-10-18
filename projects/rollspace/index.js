const { nullAddress } = require("../helper/tokenMapping");
const { sumTokensExport } = require("../helper/unwrapLPs");

const BSC_POOL_CONTRACT = '0x011b1b59Dac73AA584546dD05bbF300c9D4ecdA0';
const BLAST_POOL_CONTRACT = '0x7b0DDc2BD91Cf1a7d4e026ebdEcd575Ef760D9B8';
const BASE_POOL_CONTRACT = '0x0994c10372BB1d994a6EcCcF81E1225da589A010';
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