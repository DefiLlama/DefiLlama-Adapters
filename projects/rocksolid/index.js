const vaults = [
  '0x936facdf10c8c36294e7b9d28345255539d81bc7', // RockSolid rock.rETH, curated by Tulipa Capital
  '0x7a12D4B719F5aA479eCD60dEfED909fb2A37e428', // RockSolid rock.loopedETH, curated by Tulipa Capital
  '0xba71097e426983d840569edfa1a01396b56d86ad', // RockSolid MegaETH USDm, curated by Tulipa Capital
]
async function tvl(_, _b, _cb, { api }) {
  // Use erc4626Sum helper to automatically get underlying asset and totalAssets
  return api.erc4626Sum({ calls: vaults, tokenAbi: 'asset', balanceAbi: 'totalAssets' })
}

module.exports = {
  methodology:
    'Calls totalAssets() on the RockSolid rock.rETH, rock.loopedETH, and rockUSDm vaults to get the total value managed by the vaults.',
  start: 1756339201, //  vault launch timestamp
  ethereum: { tvl },
  timetravel: true,
  misrepresentedTokens: false,
}
