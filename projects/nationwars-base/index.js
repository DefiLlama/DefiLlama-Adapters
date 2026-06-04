const FACTORY = "0x0223F69c7742C6a31424D7aF9B3b7667c6b9797F";
const GOV_TOKEN = "0xf3bCBe4ee118ECC57c17820a2F03f46A750aB319";

async function staking(api) {
  const countries = await api.call({
    target: FACTORY,
    abi: 'address[]:getCountries',
  });

  await api.sumTokens({ owners: countries, tokens: [GOV_TOKEN]})
}

module.exports = {
  methodology: "TVL is the sum of NationWars governance tokens staked in every live Country vault. The adapter reads the full country list from CountryFactory.getCountries() and adds each country's on-chain balance.",
  base: {
    tvl: () => ({}),
    staking,
  },
};
