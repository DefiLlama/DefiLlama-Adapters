const ROUP_TOKEN_CONTRACT = "0x5a1c3f3aaE616146C7b9bf9763E0ABA9bAFc5eaE";

async function tvl(_, _1, _2, { api }) {
  const totalSupply = await api.call({
    abi: 'erc20:totalSupply',
    target: ROUP_TOKEN_CONTRACT,
    params: [],
  });
  api.add(ROUP_TOKEN_CONTRACT, totalSupply)
}


module.exports = {
  timetravel: true,
  methodology: `Tvl of ROUP on Map Protocol`,
  map: {
    tvl,
  }
}

