const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

// AlfaClub V2 room-key market. It custodies the USDG reserves backing every outstanding room key,
// plus key-trading fees not yet claimed by creators or the platform.
// https://robinhoodchain.blockscout.com/address/0x64Fb2678cCe04A352a405eAa024eE02935f0ACb9
const ROOM_KEY = '0x64Fb2678cCe04A352a405eAa024eE02935f0ACb9'
// "AlfaClub Official", the room behind the ALFA token. Its creator is AlfaClub's own wallet
// 0x3099980fC2fa83a7be54C2315483CF70DE031707 (RoomKey.creatorOf), so its creator fees are protocol funds.
const OFFICIAL_ROOM_ID = '40035824607104520286739138494982524780'

async function tvl(api) {
  // Unclaimed fees owed to the platform, and to AlfaClub as creator of its own room, sit in the same
  // contract; they are protocol revenue, not user funds, so subtract them from the raw USDG balance.
  const platformFees = await api.call({ target: ROOM_KEY, abi: 'uint256:platformFeeLedger' })
  const officialRoomFees = await api.call({ target: ROOM_KEY, abi: 'function creatorFeeLedger(uint256) view returns (uint256)', params: [OFFICIAL_ROOM_ID] })
  await sumTokens2({ api, owner: ROOM_KEY, tokens: [ADDRESSES.robinhood.USDG] })
  api.add(ADDRESSES.robinhood.USDG, -BigInt(platformFees) - BigInt(officialRoomFees))
}

module.exports = {
  methodology:
    'TVL is the USDG held by the AlfaClub V2 RoomKey contract on Robinhood Chain: the reserves backing ' +
    'every outstanding room key plus key-trading fees creators have not claimed yet. Unclaimed fees owed ' +
    'to AlfaClub itself are excluded. Room-token liquidity sits in Uniswap V3 pools and is not counted.',
  start: '2026-09-27',
  robinhood: { tvl },
}
