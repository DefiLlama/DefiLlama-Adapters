const vaults = [
  '0x936facdf10c8c36294e7b9d28345255539d81bc7', // RockSolid rock.rETH
  '0x7a12D4B719F5aA479eCD60dEfED909fb2A37e428', // RockSolid rock.loopedETH
]
async function tvl(_, _b, _cb, { api }) {
  // Use erc4626Sum helper to automatically get underlying asset and totalAssets
  return api.erc4626Sum({ calls: vaults, tokenAbi: 'asset', balanceAbi: 'totalAssets' })
}

module.exports = {
  methodology:
    'Calls totalAssets() on the RockSolid rock.rETH and rock.loopedETH vaults to get the total amount of rETH and ETH managed by the vaults.',
  start: 1756339201, //  vault launch timestamp
  ethereum: { tvl },
  timetravel: true,
  misrepresentedTokens: false,
}
