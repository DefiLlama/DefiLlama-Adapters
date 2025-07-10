const sdk = require('@defillama/sdk');

// TODO: Replace these with prod addresses. These are for test version.
const COLL_0_CONTRACT_ACTIVE_POOL="0x217ccd390beddffbde549f14b3fac3efdf12d667" // WETH
const COLL_1_CONTRACT_ACTIVE_POOL="0x0d11ea20a0f1c2ce3c3f686f3e87d96ba269aa7e" // WSTETH
const COLL_2_CONTRACT_ACTIVE_POOL="0x1bdf833c7a85848622a0a41ab123e5e20f86ee5d" // RETH
const COLL_3_CONTRACT_ACTIVE_POOL="0x1755168cedf61f8ac50ce333a871e193b4051395" // RSETH
const COLL_4_CONTRACT_ACTIVE_POOL="0xf95cc7682ef00a3358616ae640a286a164e68ada" // WEETH
const COLL_5_CONTRACT_ACTIVE_POOL="0xdac5fb19e280702c54718ce8b4a8e2851a35ab01" // ARB
const COLL_6_CONTRACT_ACTIVE_POOL="0xc3ea4966fb8d8f2fe6d272b777a8b3326d7003a7" // COMP
const COLL_7_CONTRACT_ACTIVE_POOL="0xddde0538945c775ef3b9d936830905a86711c4ee" // TBTC

const collaterals = [
  {
    id: "WETH",
    collIndex: 0,
    token: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    activePool: COLL_0_CONTRACT_ACTIVE_POOL,
  },
  {
    id: "WSTETH",
    collIndex: 1,
    token: "0x5979D7b546E38E414F7E9822514be443A4800529",
    activePool: COLL_1_CONTRACT_ACTIVE_POOL,
  },
  {
    id: "RETH",
    collIndex: 2,
    token: "0xEC70Dcb4A1EFa46b8F2D97C310C9c4790ba5ffA8",
    activePool: COLL_2_CONTRACT_ACTIVE_POOL,
  },
  {
    id: "RSETH",
    collIndex: 3,
    token: "0x4186BFC76E2E237523CBC30FD220FE055156b41F",
    activePool: COLL_3_CONTRACT_ACTIVE_POOL,
  },
  {
    id: "WEETH",
    collIndex: 4,
    token: "0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe",
    activePool: COLL_4_CONTRACT_ACTIVE_POOL,
  },
  {
    id: "ARB",
    collIndex: 5,
    token: "0x912CE59144191C1204E64559FE8253a0e49E6548",
    activePool: COLL_5_CONTRACT_ACTIVE_POOL,
  },
  {
    id: "COMP",
    collIndex: 6,
    token: "0x354A6dA3fcde098F8389cad84b0182725c6C91dE",
    activePool: COLL_6_CONTRACT_ACTIVE_POOL,
  },
  {
    id: "TBTC",
    collIndex: 7,
    token: "0x6c84a8f1c29108F47a79964b5Fe888D4f4D0dE40",
    activePool: COLL_7_CONTRACT_ACTIVE_POOL,
  },
]

async function tvl(api) {
  const collateralBalance = await sdk.api.abi.multiCall({
    abi: 'erc20:balanceOf',
    calls: collaterals.map((collateral) => ({
      target: collateral.token,
      params: [collateral.activePool],
    })),
  });

  collateralBalance.output.forEach((balance, index) => {
    api.add(collaterals[index].id, balance.output);
  });
}

module.exports = {
  methodology: 'counts the collateral tokens in the active pools for TVL.',
  start: 355606399,
  arbitrum: {
    tvl,
  }
}; 