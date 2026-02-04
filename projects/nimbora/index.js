const { ChainApi } = require('@defillama/sdk');
const ADDRESSES = require('../helper/coreAssets.json')
const TROVE_HIGH_RISK = "0xEF3cf0ede2cA738A8Bd0c38fd5D43DC639B41532";
const TROVE_MEDIUM_RISK = "0x4cdB2fdE85Da92Dbe9b568dda2Cc22d426b0b642";
const TROVE_MANAGER = "0xA39739EF8b0231DbFA0DcdA07d7e29faAbCf4bb2";

async function tvl(api) {
  api = new ChainApi({ chain: 'ethereum', timestamp: api.timestamp })
  await api.getBlock()

  const multicallResponse = await api.multiCall({
    abi: "function getEntireDebtAndColl(address _borrower) payable returns (uint256 debt, uint256 coll, uint256, uint256)",
    calls: [TROVE_HIGH_RISK, TROVE_MEDIUM_RISK],
    target: TROVE_MANAGER,
  });
  multicallResponse.forEach(i => {
    api.add(ADDRESSES.null, i.coll)
    api.add(ADDRESSES.ethereum.LUSD, i.debt * -1)
  })
  return api.getBalances()
}

module.exports = {
  methodology: "The TVL is calculated as a sum of total assets deposited into the Trove contracts.",
  starknet: {
    tvl,
  },
};