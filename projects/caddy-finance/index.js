const { call } = require("../helper/chain/starknet");
const ADDRESSES = require('../helper/coreAssets.json');
const { positionABI, positionStruct, u256Struct } = require('./abi');

const USDC = ADDRESSES.ethereum.USDC
const tBTC = ADDRESSES.ethereum.tBTC

const CONFIG = {
  pool: '0x03976cac265a12609934089004df458ea29c776d77da423c96dc761d09d24124',
  user: '0x306dcfa0a08166fd52292afa8e30f10df36dda1b2e338eb8f579936aeefd082',
  collToken: ADDRESSES.starknet.tBTC,
  debtToken: ADDRESSES.starknet.USDC_CIRCLE,
}

async function tvl(api) {
  const { pool, user, collToken, debtToken } = CONFIG

  const position = await call({ target: pool, abi: positionABI, params: [collToken, debtToken, user], allAbi: [positionStruct, u256Struct] })
  const { collateral_shares } = position[0]
  api.add(tBTC, Number(collateral_shares), { skipChain: true })
}

module.exports = {
  doublecounted: true,
  methodology: `TVL represents the total assets held by the Caddy Finance Vault on Starknet.`,
  starknet: { tvl },
};