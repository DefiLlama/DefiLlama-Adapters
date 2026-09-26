const FOLD = "0xE172e9B6cfBeeB5593bDcE3f077356FDb33af904";
const SUSDS = "0xa3931d71877C0E7a3148CB7Eb4463524FEc27fbD";
const TICKET_TOKEN = "0xC0B5b49a3949eC4B520eF21BaCFE16e3695F3B5D";
const BONDING_REGISTRY = "0x0ec90465095C21830BEcED07e032809A2Bd2915F";

async function tvl(api) {
  return api.sumTokens({ owner: TICKET_TOKEN, tokens: [SUSDS] });
}

async function staking(api) {
  await api.sumTokens({ owner: BONDING_REGISTRY, tokens: [FOLD] });
  const slashed = await api.call({
    target: BONDING_REGISTRY,
    abi: "uint256:slashedCiphernodeBond",
  });
  api.add(FOLD, -BigInt(slashed));
}

module.exports = {
  doublecounted: true,
  methodology:
    "TVL is the sUSDS collateral that backs Interfold ticket tokens. It is marked doublecounted because the underlying USDS is also counted by Sky. Staking is the FOLD collateral bonded by ciphernode operators in the BondingRegistry, excluding slashed FOLD awaiting treasury withdrawal. E3 fee escrow, pending rewards, refunds, and protocol revenue are excluded.",
  ethereum: {
    tvl,
    staking,
  },
};
