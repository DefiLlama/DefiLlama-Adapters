const sdk = require('@defillama/sdk');
const ADDRESSES = require('../helper/coreAssets.json')
const static_contract = "0xA25F892cF2731ba89b88750423Fc618De0959C43";

async function tvl(api) {

  const balance = await api.call({
    abi: 'function getTVL() external view returns (uint)',
    target: static_contract,
  });

  api.add(ADDRESSES.null,balance)
}

module.exports = {
  timetravel: false,
  methodology: 'Get the total amount of pledge and account balance of fil in the statistical contract',
  filecoin: {
    tvl
  }
};