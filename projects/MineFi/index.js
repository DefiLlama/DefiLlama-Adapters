const sdk = require('@defillama/sdk');
const ADDRESSES = require('../helper/coreAssets.json')
const MINEFI_CONTRACT = "0xa0E711D8cBdb07176C30C73031F8018Ce7d4e5AB";


async function tvl(_, _1, _2, { api }) {

  const collateralBalance = await api.call({
    abi: 'function getTvl() external view returns (uint256)',
    target: MINEFI_CONTRACT,
  });

  api.add(ADDRESSES.null,collateralBalance)
}



module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: 'counts the number of pledge filecoins in the minefi contract',
  filecoin: {
    tvl
  }
};