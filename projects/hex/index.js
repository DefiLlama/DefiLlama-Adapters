const ADDRESSES = require('../helper/coreAssets.json')

/*
Example globalInfo response:
[
  '63291210732671135858',  // lockedHeartsTotal - Total HEX locked in stakes
  '226407617253461309',    // nextStakeSharesTotal - Total stake shares for the next day
  '399878',                // shareRate - Current rate for converting HEX to shares
  '118480842817096',       // stakePenaltyPool - Pool of penalties from ended stakes
  '1898',                  // daysStored - Number of days of history stored
  '34928647070431443773',  // stakeSharesTotal - Total shares in the staking system
  '910626',                // latestStakeId - ID of the most recent stake
  '1786651846416372',      // unclaimedSatoshisTotal - Unclaimed BTC satoshis
  '25673397100358',        // claimedSatoshisTotal - Claimed BTC satoshis
  '30716',                 // claimedBtcAddrCount - Number of BTC addresses that claimed
  '1739390985',            // currentContractDay - Current day number since contract launch
  '2885808205097197807',   // totalSupply - Total circulating supply of HEX
  '0'                      // Last value (unused)
]
*/

async function staking(api) {
  const globalInfo = await api.call({ abi: "function globalInfo() view returns (uint256[13])", target: ADDRESSES.pulse.HEX })
  api.add(ADDRESSES.pulse.HEX, globalInfo[0])
}

module.exports = {
  methodology: "TVL consists of HEX tokens staked in the protocol on PulseChain, plus liquidity in Uniswap V2 pools. The globalInfo function returns an array where the first element [0] represents the total amount of HEX tokens locked in stakes (lockedHeartsTotal).",
  pulse: {
    staking,
  },
  ethereum: {
    tvl: () => ({}),
    staking,
  }
}