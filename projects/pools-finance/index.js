const iota = require('../helper/chain/iota')

const DECIMALS = {
  '0x2::iota::IOTA': 9,
  '0x346778989a9f57480ec3fee15f2cd68409c73a62112d40a3efd13987997be68c::cert::CERT': 9,
  '0xd3b63e603a78786facf65ff22e79701f3e824881a12fa3268d62a75530fe904f::vusd::VUSD': 6,
}

async function tvl() {
  const poolIds = [
    '0xcd2b276437db9612fc7a8d85fe5b3b09a6b5638c0b3ab2003f5f7b284e353d8c',
    '0xb768e68c0337a58d8b769f6c270f0b17541f5a5952d9fd9bae1fa909027ce756',
    '0x9b5c57e9eb88e85abf9b9b29ac7814ff7289ea2904c2713b5df92c8ebf99fe1b'
  ]

  let balances = {
    '0x2::iota::IOTA': 0,
    '0x346778989a9f57480ec3fee15f2cd68409c73a62112d40a3efd13987997be68c::cert::CERT': 0,
    '0xd3b63e603a78786facf65ff22e79701f3e824881a12fa3268d62a75530fe904f::vusd::VUSD': 0,
  }

  for (const poolId of poolIds) {
    const pool = await iota.getObject(poolId)
    if (pool && pool.fields && pool.type) {
      const match = pool.type.match(/<(.+), (.+)>/)
      if (!match) continue
      const [ , tokenA, tokenB ] = match
      if (pool.fields.coin_a && DECIMALS[tokenA] !== undefined) {
        const value = Number(BigInt(pool.fields.coin_a) / BigInt(10 ** DECIMALS[tokenA]))
        balances[tokenA] += value
      }
      if (pool.fields.coin_b && DECIMALS[tokenB] !== undefined) {
        const value = Number(BigInt(pool.fields.coin_b) / BigInt(10 ** DECIMALS[tokenB]))
        balances[tokenB] += value
      }
    }
  }

  const nativePool = await iota.getObject('0x02d641d7b021b1cd7a2c361ac35b415ae8263be0641f9475ec32af4b9d8a8056');
  const metadata = await iota.getObject('0x8c25ec843c12fbfddc7e25d66869f8639e20021758cac1a3db0f6de3c9fda2ed');

  const total_supply = Number(BigInt(metadata.fields.total_supply.fields.value));
  const total_staked = Number(BigInt(nativePool.fields.total_staked));
  const total_rewards = Number(BigInt(nativePool.fields.total_rewards));

  let exchange_rate = 1;
  if ((total_staked + total_rewards) > 0) {
    exchange_rate = total_supply / (total_staked + total_rewards);
  }
  
  const certAsIota = balances['0x346778989a9f57480ec3fee15f2cd68409c73a62112d40a3efd13987997be68c::cert::CERT'] * exchange_rate;
  const totalIota = balances['0x2::iota::IOTA'] + certAsIota;

  return {
    iota: totalIota,
    vusd: balances['0xd3b63e603a78786facf65ff22e79701f3e824881a12fa3268d62a75530fe904f::vusd::VUSD'],
  }
}

module.exports = {
  methodology: "Calculates the TVL of Pools Finance on IOTA.",
  timetravel: false,
  iota: {
    tvl,
  }
} 