const { getBalance2 } = require('../helper/chain/cosmos');

async function tvl(chain, contract) {
  let balances = await getBalance2({
    owner: contract,
    chain
  });
  return rename_balance(balances)
}

function rename_balance(obj) {
  const keyMappings = {
    uwhale: 'white-whale',
    ujuno: 'juno-network',
    uhuahua: 'chihuahua-token'
  };

  const new_balance = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = keyMappings[key] || key;
      const originalValue = parseFloat(obj[key]);
      // All 6 decimals for juno migaloo and huahua
      const to_big_denom = (originalValue / 1000000).toString();
      new_balance[newKey] = to_big_denom;
    }
  }
  return new_balance;
}

module.exports = {
  timetravel: false,
  juno: { tvl: () => tvl("juno", "juno1puyjxrxkkwc9ms63a297vx2aln4kqsaeegnclknt99py59elandses9f3j") },
  migaloo: { tvl: () => tvl("migaloo", "migaloo1q6vmqprwvay5p3l0d763v50ufunt7fwfnfwp85wne5xan4meeqpsdvzyvy") },
  chihuahua: { tvl: () => tvl("chihuahua", "chihuahua18s2dazpmva4t38rtnrlj3gjpsntmcdrk6v9220kt4yxckhqus3vssqsrgp") },
}