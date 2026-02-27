const GENESIS_ADDRESS = '0x243AC97f37040A7f64a11B84c818cE222A8d3ab7';

async function tvl(api) {
  const balance = await api.getBalance(GENESIS_ADDRESS);
  api.addCGToken('native', balance);
}

module.exports = {
  methodology: 'Tracks PTEK native token balance in the genesis miner address (0x243AC97f37040A7f64a11B84c818cE222A8d3ab7) which received 21M PTEK at genesis.',
  start: 0,
  proptech: { tvl },
};