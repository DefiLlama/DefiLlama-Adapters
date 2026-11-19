const { compoundExports2 } = require('../helper/compound')
const abi = {
  "getNextPositionId": "function getNextPositionId() view returns (uint256)",
  "getPositionValue": "function getPositionValue(uint256 positionId) view returns (uint256)"
}
const sdk = require('@defillama/sdk');

const BANK = '0xa34F59F634d48E2c3606048f2367326c46a4B5fA';

async function tvl(api) {
  const positionValuesRes = await api.fetchList({ lengthAbi: abi.getNextPositionId, itemAbi: abi.getPositionValue, target: BANK, permitFailure: true })
  const positionValues = positionValuesRes.filter(value => value != null)
  api.addCGToken('tether', positionValues.reduce((acc, i) => acc + i / 1e18, 0))
  return api.getBalances()
}
const compoundExports = compoundExports2({ comptroller: '0xcb0D9Ff5BDD34521c6f8CDbeAf15e1A76Fa4dd5D' })

module.exports = {
  methodology:
    "V2: TVL is calculated from deposits in the vault and on Hyperliquid. V1: token value in ethereum lending market",
  misrepresentedTokens: true,
  ethereum: {
    tvl: sdk.util.sumChainTvls([compoundExports.tvl, tvl]),
    borrowed: compoundExports.borrowed
  },

  // v2
  hyperliquid: {
    tvl: async (api) => {
      const BBHLP_VAULT_ROUTER_ADDRESS = "0x647a4D7F1F20Cf237C27b39fB6924f5a7691BB4b";
      const tvlValue = await api.call({ abi: "uint256:tvl", target: BBHLP_VAULT_ROUTER_ADDRESS, });
      api.addUSDValue(tvlValue / 1e18)
    }
  },
  monad: {
    tvl: async (api) => {
      const vaults = [
        '0xC2ddc1004CA0d6cC4bFd1dCD03Dcf855bED8E670',
        '0x215394B5677Cb7a18B6fA8cc2cD155C024ee6b2E',
      ]
      return api.erc4626Sum({calls: vaults, isOG4626: true, })
    }
  }
}
