const { sumTokensExport, nullAddress } = require('../helper/sumTokens')

// What the protocol owns on Robinhood Chain:
// - the $OVER reserve wallet: of the 150M $OVER set aside to back payouts, 50M went into the $OVER vault and the rest
//   stays here;
// - in both vaults ($OVER and USDG), the house capital (it backs every payout) and the fee revenue not withdrawn yet.
//   The deposits of open positions and the creator royalty in a vault belong to players and creators, so they are not
//   counted here (they are the protocol's tvl, projects/overcall).
// $OVER is the protocol's own token, priced by its CoinGecko id (the coins server has no price for its Robinhood Chain
// address yet).
const RESERVE = '0x437bCF676D11FFE5542BfAa842b560e431285065'
const OVER = '0x6245Db7f52379bD9757c9DdcE6519768FfaB3a4F'
const OVER_VAULT = '0xFB4C6062c24313E2E8Cf01D1CCBa0B940e7b29f6'
const USDG = '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168'
const USDG_VAULT = '0x526b07940694f599aA2e9DbDE30540BE004aC80e'

// the protocol's part of a vault: its capital and its revenue
const owned = (api, vault) => Promise.all([
  api.call({ abi: 'uint256:capital', target: vault }),
  api.call({ abi: 'uint256:revenue', target: vault }),
]).then(([capital, revenue]) => BigInt(capital) + BigInt(revenue))

async function ownTokens(api) {
  const [reserve, vault] = await Promise.all([
    api.call({ abi: 'erc20:balanceOf', target: OVER, params: [RESERVE] }),
    owned(api, OVER_VAULT),
  ])
  api.addCGToken('overcall', Number(BigInt(reserve) + vault) / 1e18)
}

const reserveTvl = sumTokensExport({ owners: [RESERVE], tokens: [nullAddress, USDG] })

async function tvl(api) {
  await reserveTvl(api)
  api.add(USDG, await owned(api, USDG_VAULT))
}

module.exports = {
  robinhood: {
    tvl,
    ownTokens,
  },
}
