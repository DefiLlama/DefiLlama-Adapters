const ADDRESSES = require('../helper/coreAssets.json')

const BOAR_BTC_RELAY = '0x920b1c573F503554E113e4c47A92cd289a3d1625';
const VEBTC = '0x3D4b1b884A7a1E59fE8589a3296EC8f8cBB6f279';
const LOCKED_ABI = 'function locked(uint256) view returns (int128 amount, uint256 end, bool isPermanent, uint256 boost)';

async function tvl(api) {
  const mTokenId = await api.call({ target: BOAR_BTC_RELAY, abi: 'uint256:mTokenId' });
  const locked = await api.call({ target: VEBTC, abi: LOCKED_ABI, params: [mTokenId] });
  api.add(ADDRESSES.mezo.BTC, locked.amount);
}

module.exports = {
  methodology: "Counts BTC locked in the BoarBTCRelay managed veBTC position. The relay aggregates user BTC into a single managed veNFT to earn yield from Mezo's chain fee distribution.",
  doublecounted: true,
  mezo: { tvl },
};