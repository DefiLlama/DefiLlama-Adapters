const { getFactoryTvl } = require('../terraswap/factoryTvl')

const factory = 'dungeon1643rdx7yzxfhmy6ru6456t2twxhshtt9k394jh8u7qk59qfgz0esjku43x'
// These active pools predate the current factory migration and remain available in the DEX UI.
// Source: https://dex.dungeongames.io/mainnet/dungeon-1/pools_list.json
const legacyPairs = [
  'dungeon1726r6fgz7xvmr57c0jnxpjq4u32wnd37zev5xq0t57g5g5t6s5vqvkkpld',
  'dungeon1qydhnhax5sqn7n9syjvz90z2a24ja798nwgt0fuytx5j7ptkqrtsz0dh5v',
  'dungeon1dy4udqns392grdwkjqgm6kd7k6cqzxr0rah6eetxskhfr0lq406ssfmtyr',
  'dungeon1qlzmxgu32sdww5fa6yw0hcxetj5pl6fjucug0vmksr9qkllgpwgs7qx260',
]

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: 'Liquidity in constant-product pools registered by the Dungeon DEX factory plus active legacy pools from before the current factory migration.',
  dungeon: {
    tvl: getFactoryTvl(factory, { extraPairs: legacyPairs }),
  },
}
