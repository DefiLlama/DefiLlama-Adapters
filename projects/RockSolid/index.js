const vault = '0x936facdf10c8c36294e7b9d28345255539d81bc7' // RockSolid rock.rETH

async function tvl(_, _b, _cb, { api }) {
  // Use erc4626Sum helper to automatically get underlying asset and totalAssets
  return api.erc4626Sum({ calls: [vault], tokenAbi: 'asset', balanceAbi: 'totalAssets' })
}

module.exports = {
  methodology:
    'Calls totalAssets() on the RockSolid rock.rETH vault to get the total amount of rETH managed by the vault.',
  start: 1756339201, //  vault launch timestamp
  ethereum: { tvl },
  timetravel: true,
  misrepresentedTokens: false,
}
