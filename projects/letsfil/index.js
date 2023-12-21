const sdk = require('@defillama/sdk');
const ADDRESSES = require('../helper/coreAssets.json')
const LETSFIL_CONTRACT = "0x02F0C30Eb92e89912371242Ee86Fe98050D040A5";


async function tvl(_, _1, _2, { api }) {

  const collateralBalance = await api.call({
    abi: 'function getTvl() external view returns (uint256)',
    target: LETSFIL_CONTRACT,
  });

  // await sdk.util.sumSingleBalance(balances, LETSFIL_CONTRACT, collateralBalance, api.chain)
  // return balances;

  api.add(ADDRESSES.null,collateralBalance)
}



module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: 'counts the number of pledge filecoins in the letsfil contract',
  filecoin: {
    tvl
  }
};
