/**
 * lisAster — Lista DAO's ASTER yield aggregator.
 *
 * Users deposit ASTER into AsterVault, which locks it permanently in
 * veASTER (Aster's official staking) at the maximum 208-week duration
 * with auto-relock to maintain full veASTER weight. lisAster is minted
 * 1:1 on deposit, so its ERC20 total supply equals the underlying ASTER
 * locked through the protocol.
 *
 * TVL = lisAster.totalSupply() priced as ASTER.
 */

const ASTER = '0x000Ae314E2A2172a039B26378814C252734f556A'
const LIS_ASTER = '0xa17A497D20cC143508FE3b63578b13ba6b9c9f06'

async function tvl(api) {
  const supply = await api.call({
    abi: 'erc20:totalSupply',
    target: LIS_ASTER,
  })
  api.add(ASTER, supply)
}

module.exports = {
  doublecounted: true,
  methodology:
    'TVL is the ASTER permanently locked through lisAster — equal to lisAster ERC20 total supply (minted 1:1 on deposit).',
  bsc: { tvl },
}
