const SPINE_VAULT = '0x38cc0dae2c4305c16f3d702f9a0260599e14654f';
const BORROW_CONTROLLER = '0xce1d096e3bd08b3114a23d916a45c7cf8966d6ea'
const DEBT_TOKEN = '0x5fc5360d0400a0fd4f2af552add042d716f1d168'
const COLLATERAL_TOKEN = '0x4bcb25fce9618e62e9f9fba8d65af50cf867b812'

async function tvl(api) {
  const debtAssets = await api.call(
    {
      abi: 'uint256:totalAssets',
      target: SPINE_VAULT,
      params: [],
    }, 
  )

  const collateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: COLLATERAL_TOKEN,
    params: [BORROW_CONTROLLER],
  })
  api.add(COLLATERAL_TOKEN, collateralBalance)
  api.add(DEBT_TOKEN, debtAssets)
}

module.exports = {
  methodology: 'gets total Assets from the Spine vault and adds it to the collateral balance in the borrow controller.',
  robinhood: {
    tvl,
  }
}; 