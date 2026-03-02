const { getLogs2 } = require('../helper/cache/getLogs')

// USDC.e (Bridged USDC via Stargate) - 6 decimals
const USDC_E_ADDRESS = '0x31EEf89D5215C305304a2fA5376a1f1b6C5dc477'

// DomaFractionalization Diamond Proxy
const DOMA_FRACTIONALIZATION = '0xd00000000004f450f1438cfA436587d8f8A55A29'

// Contract deployment block
const FROM_BLOCK = 2887493

const eventAbi = 'event NameTokenFractionalized(address indexed tokenAddress, uint256 indexed tokenId, address tokenOwner, address fractionalTokenAddress, address launchpadAddress, address vestingWallet, uint256 fractionalizationVersion, (uint256,uint256,address,string,string,uint8,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint64,uint64,bytes,address,uint256,uint256,bytes,address,bytes,address,uint64,uint64,uint256,uint160,string,bytes32) params)'

async function tvl(api) {
  const logs = await getLogs2({
    api,
    target: DOMA_FRACTIONALIZATION,
    eventAbi,
    fromBlock: FROM_BLOCK,
  })

  // TVL = USDC.e in Doma-owned contracts only:
  // 1. DomaFractionalization contract - holds buyout/redemption funds
  // 2. Launchpad contracts - holds USDC.e from token sales
  //
  // Note: Graduated launchpads are included but will have $0 balance
  // since their funds migrated to Uniswap V3 pools.
  //
  // Excluded:
  // - Uniswap V3 pools (DEX liquidity, not protocol-locked value)
  // - Vesting wallets (uncirculating tokens)
  const owners = logs.map(i => i.launchpadAddress)
  owners.push(DOMA_FRACTIONALIZATION)
  return api.sumTokens({ owners, tokens: [USDC_E_ADDRESS],  })
}

module.exports = {
  methodology:
    'TVL is calculated by summing USDC.e balances in Doma protocol contracts: ' +
    '(1) the DomaFractionalization contract which holds buyout/redemption funds, and ' +
    '(2) launchpad contracts discovered via on-chain NameTokenFractionalized events. ' +
    'Graduated launchpads have $0 balance since funds migrate to DEX pools upon graduation. ' +
    'Uniswap V3 pools are excluded as they represent DEX liquidity, not protocol-locked value. ' +
    'Vesting wallets are excluded as they contain uncirculating tokens.',
  doma: { tvl },
}
