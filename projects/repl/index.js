const { nullAddress } = require('../helper/tokenMapping');
const { get } = require('../helper/http');
const abi = require('./abi.json');
const { json } = require('starknet');
const { ethers } = require('ethers');
const http = require('../helper/http');

const WFIL_WPFIL_POOL_ADDRESS = '0x443A6243A36Ef0ae1C46523d563c15abD787F4E9';
const PFIL_CONTRACT = '0xAaa93ac72bECfbBc9149f293466bbdAa4b5Ef68C';
const WPFIL_CONTRACT = '0x57E3BB9F790185Cfe70Cc2C15Ed5d6B84dCf4aDb';
const WFIL_CONTRACT = '0x60E1773636CF5E4A227d9AC24F20fEca034ee25A';

const filecoinCoinGeckoAPI =
  'https://api.coingecko.com/api/v3/simple/price?ids=filecoin&vs_currencies=usd';
async function query(api) {
  return http.get(`${api}`);
}

module.exports = {
  filecoin: {
    tvl: async (_, _1, _2, { api }) => {
      const [FILpriceData, resp] = await Promise.all([
        query(filecoinCoinGeckoAPI),
        // Retrieving this information directly on-chain is prohibitively costly.
        // To alleviate this, we've encapsulated the TVL in a server, retrieve directly from the Filecoin chain
        // This serves the data in a more efficient format and prevents overloading the Defillama frontend
        get('http://repl.fi/api/stats'),
      ]);
      const tvlFIL = ethers.parseEther(resp.tvl_fil.toString());

      api.add(nullAddress, tvlFIL);
    },
  },
};
