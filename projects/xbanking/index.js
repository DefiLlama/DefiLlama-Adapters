const sdk = require('@defillama/sdk');
const ADDRESSES = require('../helper/coreAssets.json')
const ETHEREUM_CONTRACT = "0xC4356aF40cc379b15925Fc8C21e52c00F474e8e9";


async function tvl(_, _1, _2, { api }) {
  const bal = await api.call({
    abi: 'function getTvl() external view returns (uint256)',
    target: ETHEREUM_CONTRACT,
  });
  api.add(ADDRESSES.null, bal)
}



module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: 'h1test',
  ethereum: {
    tvl
  }
};
