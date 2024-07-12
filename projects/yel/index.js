const ADDRESSES = require('../helper/coreAssets.json')
const WETH = ADDRESSES.blast.WETH
const USDB = ADDRESSES.blast.USDB
const BLAST = ADDRESSES.blast.BLAST

const { sumTokens2 } = require('../helper/unwrapLPs');
const { staking } = require('../helper/staking');

const yelToken = '0x949185D3BE66775Ea648F4a306740EA9eFF9C567';

const blastIndexLp = '0x7D8490333315EaAa5e93F3C6983d1e8128D7f50f';
const yelInitialLp = '0x1e7Dd1829c6f905Db35320385e036E62970d11f5';

const yelIndex = '0x7d2f5881F0C4B840fcFA2c49F4052d1A004eAf0d';
const wethIndex = '0x795a85CD543D0E2d29F7e11e33a20a38A4b5121e';
const blastIndex = '0x07BF0Bc908Ef4badF8ec0fB1f77A8dBFe33c33c0';

const config = {
  blast: { vaults: [yelIndex, wethIndex, blastIndex], tokens: [yelToken, WETH, BLAST] },
}

module.exports = {
  methodology: 'YelFinance TVL is calculated by summing assets in all indexes created. Also add liquidity to the TVL with the WETH + YEL',
};

['blast'].forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      const vaults = config[chain]?.vaults;
      const tokens = config[chain]?.tokens;
      return sumTokens2({ api, tokensAndOwners2: [tokens, vaults]})
    }
  }
});

module.exports.blast.staking = staking([blastIndexLp], [USDB])
module.exports.blast.pool2 = staking([yelInitialLp], [WETH, yelToken])
