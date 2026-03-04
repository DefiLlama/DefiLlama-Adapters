
const { getVaultBalance, fortyAcresMapping, baseTokenMapping, veNftMapping, getBorrowed , getAvaxTvl,} = require("./helpers");
const { unwrapSolidlyVeNft } = require('../helper/unwrapLPs');


async function getLockedVeNFTBalance(api) {
  if(api.chain==='avax')
    await getAvaxTvl(api);
  else
    await unwrapSolidlyVeNft({ api, baseToken: baseTokenMapping[api.chain], veNft: veNftMapping[api.chain], owner:fortyAcresMapping[api.chain][0]});
}


async function tvl(api) {
  await getLockedVeNFTBalance(api, fortyAcresMapping[api.chain]);
  await getVaultBalance(api)
  return
}


async function borrowed(api) {
  await getBorrowed(api)
}



module.exports = {
  timetravel: true,
  start: '2025-01-31',
  methodology: `TVL is comprised of tokens deposited to the protocol as collateral and tokens deposited to the vault for lending. Borrowed tokens are not counted towards TVL.`,
  base: { tvl: tvl, borrowed: borrowed },
  optimism: { tvl: tvl, borrowed: borrowed },
  avax : { tvl: tvl, borrowed: borrowed }
}
