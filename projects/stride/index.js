const { sumTokens } = require("../helper/chain/cosmos");

// stTokens were minted on these chains' host zones. The Stride chain halted on 2026-11-13, keys kept so tvl history stays
const haltedChains = [
  "stride", "cosmos", "stargaze", "juno", "terra2", "evmos", "injective", "umee",
  "comdex", "sommelier", "dydx", "celestia", "dymension", "islm", "band",
];

// stToken redemption pools (transmuter v3.2.0, code id 996) funded and administered by Stride's vault osmo1k8c2m5cn322akk5wy8lpt87dd2f4yh9afcd7af
const REDEMPTION_POOLS = [
  "osmo1k49dzwmaq3r99v5gam23vn62akl67n8aye4f34lmw799tlm3l9yqctyf9p", // stATOM
  "osmo18tcy9q5mdp05khs0sgyldtjthrlpsdecsxr9w2aqppsuvyaggkxsxawh04", // stATOM.agoric
  "osmo1kfw8err6zl8mcf77t5lkgrh2yk0u6nkhaeegyalx4a6xr5f4vv8sk85884", // stATOM.cosmoshub
  "osmo1f8ca03ah9yfmsxhj3waxsh8qs7cdj4nnh4lqa0hrk223srmtlheqd938ef", // stATOM.injective
  "osmo1t5ulc4wz63sq3fmcfuk92czvd9q0pypsp6232m929aptx7t8kwys04ha3r", // stATOM.neutron
  "osmo14aedxwpxefa0vw4uc35nzc58hrjgq94xpvzwlghkunch9asmmfcs7rrswc", // stATOM.secret
  "osmo1frf5wzs8fl2vj3p39vn4walkzkwkara440qfk64jf4ckrzuweg4s2u6sgn", // stATOM.terra
  "osmo1zhpuj7cc9vxdjwp8wy3d4pugp35hnkysf2l0feudhkv5chr8qehs36ar38", // stBAND
  "osmo14h0emmfz7rpfxfd5dj86f24x2fllevmwg57wel8xs0h27cqxfgcshs740n", // stBAND.cosmoshub
  "osmo19rjdcr48qrx4megltm6d2w4wv5xqmdlyjypl7m23u5n7h0yx9csqvu3vlq", // stDYDX
  "osmo1x99p42xnv78utnkg7sxsnfxfzgfu089gvglprnug8wljkquqzkgqz0d5n7", // stDYDX.cosmoshub
  "osmo1apslth04ntm77ywzfzg990ustchweqtjdnnfrcafx4zrjke75d8sd9xuy0", // stINJ
  "osmo183v2x64xksqt9szpzkrqwedjt3tl0a9ufaqh9kj9k56nehemdcqq008a5c", // stINJ.cosmoshub
  "osmo1tjrrh046kdrk8s6zqfap7wa4tvczw44d7pdf7wcgfrqh6ujxperqpww8ca", // stINJ.injective
  "osmo1mg7wgzux33lxgwn5c6hkn95c7s3qs8373hg54chg7erdmlafvknsrq7uqj", // stINJ.secret
  "osmo1sj5z3zd3s28nfh8y06ctag8a5h6sn8na7dpl7cqvauyyv6xpg26qyrjp89", // stISLM
  "osmo19u4re0amqzz9guukgwf48vkq08tjf0ws0lfk3mqlazhydrq3278qe020cl", // stISLM.haqq
  "osmo175cxam9qmqk9qc8rtefmpmcyydle8hfhu2w7rgcec53u3f3xw5cqsnqsda", // stJUNO
  "osmo1frx7zjyutdpd0sdzzuz2xhlfg5ywd7e5rcpvjw72unr2ldql3u2q6u4nnu", // stLUNA
  "osmo1clll7pq9syppk6dm9a96r72rnnchvhgpylvkpr5zuca8t64nlexsw9xdxv", // stLUNA.terra
  "osmo1zlrlj9ejwe9eqsy6rsuwk489vt2trfr3p0486f3y7064wg3d0zrsaughew", // stOSMO
  "osmo1xwj3ru737vcp2rrsy8yc39z8ayu8m8mdy9wc0q39l4nwzc8w4l2qayd38c", // stOSMO.cosmoshub
  "osmo1lvndmypu0npfvygnsktuegtke6z80x4r7z0xj5v908p8mpg4js9qzwefqe", // stOSMO.secret
  "osmo1224vqh0h99cuu32xm2w88zd2lha06y6dukfyngsu9w32zja0ykxqqtuehk", // stSAGA
  "osmo15kjrvxz9h59hdv08tpy0u5cgaq3jdc9kd63sqr7eplm83y9h86nq3q4q9t", // stSOMM
  "osmo1ru4ncmqln6xyt6rs63y0l4spdc7zm5x5hqma9ew2g6kx8z3seu4qk5da2l", // stTIA
  "osmo169qt0zcxcxa0xr5qqanyt2zhd6j9laj2k52n2uc3ljgcd3qm80nq0mad9z", // stTIA.agoric
  "osmo10y67eepyunrnm8g5ujtd9csg03ue2mdvexxzfeu9lzlewszqzz5sz4zc7w", // stTIA.celestia
  "osmo1fe75mvghgtz4ly0qdtegt4m3wqs2kszqqup60g67nfyuw8tt9zhq654fxc", // stTIA.cosmoshub
  "osmo1wefhqc0yywyc36kxas6mjyj3fn540hmzcs2aa30z7rwu095se03s64rs3a", // stTIA.dymension
  "osmo1em4u6ryfp6axd7dkdj3gezj7sc6fqd6rs6jqm85rg0tse2ddxg3q3hkjcx", // stTIA.neutron
];

// native tokens backing the pools, the stTokens already redeemed into them are not counted
const NATIVE_DENOMS = [
  "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2", // ATOM
  "ibc/D79E7D83AB399BFFF93433E54FAA480C191248FC556924A2A8351AE2638B3877", // TIA
  "ibc/64BA6E31FE887D66C6F8F31C7B1A80C7CA179239677B4088BB55F5EA07DBE273", // INJ
  "ibc/69110FF673D70B39904FF056CFDFD58A90BEC3194303F45C32CB91B8B0A738EA", // ISLM
  "ibc/831F0B1BBB1D08A2B75311892876D71565478C532967545476DF4C2D7492E48C", // DYDX
  "ibc/F867AE2112EFE646EC71A25CD2DFABB8927126AC1E19F1BBF0FF693A4ECA05DE", // BAND
  "ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED", // JUNO
  "ibc/785AFEC6B3741100D15E7AF01374E3C4C36F24888E96479B1C33F5C71F364EF9", // LUNA
  "ibc/9BBA9A1C257E971E38C1422780CE6F0B0686F0A3085E2D61118D904BFE0F5F5E", // SOMM
  "ibc/094FB70C3006906F67F5D674073D2DAFAFB41537E7033098F5C752F211E7B6C2", // SAGA
  "uosmo",
];

async function osmosisTvl(api) {
  return sumTokens({ api, owners: REDEMPTION_POOLS, tokens: NATIVE_DENOMS });
}

module.exports = {
  timetravel: false,
  methodology:
    "Until the Stride chain halted on 2026-11-13, counted each stToken's supply times its redemption rate. Since the halt, counts the native tokens backing stToken redemptions in the Osmosis transmuter pools owned by Stride's multisig, without the stTokens already redeemed into them. On Berachain, counts the receipt tokens staked in Stride's manager contract.",
  hallmarks: [
    ['2026-09-29', 'Stride chain shutdown proposed (funding shortfall); redemptions until Oct 12, moving to Osmosis ~Nov 20'],
    ['2026-11-13', 'Stride chain halted, stToken backing moved to Osmosis redemption pools'],
  ],
  osmosis: {
    tvl: osmosisTvl,
  },
}; // node test.js projects/stride/index.js

for (const chain of haltedChains) {
  module.exports[chain] = { tvl: () => ({}) };
}

// ############### Berachain TVL ###############
// Berachain TVL is calculated differently than the other chains Stride
// supports.
const MANAGER_CONTRACT_ADDRESS = "0xDcc5E38f0207757604c5a4925A870dE9554395b4";
function makeBerachainTvlFn() {
  return async (api) => {
    // Get all whitelisted receipt tokens (vaults)
    const receipts = await api.call({
      target: MANAGER_CONTRACT_ADDRESS,
      abi: 'function receipts() view returns (address[])',
    });

    // For each vault, get the total staked amount
    const stakedAmounts = await api.multiCall({
      target: MANAGER_CONTRACT_ADDRESS,
      abi: "function totalStakedByReceipt(address receipt) view returns (uint256)",
      calls: receipts,
    });
    api.add(receipts, stakedAmounts);
  };
}

module.exports["berachain"] = {
  tvl: makeBerachainTvlFn(),
};
