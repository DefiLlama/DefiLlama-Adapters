
const { queryContract } = require('../helper/chain/cosmos')

const osmosisVaults = {
  stOSMO: "osmo16s3sxs5886p42kteunp6370pken2n5ukzszz0trkr39epqtawn2qk4r9l5",
  stTIA: "osmo1q3w9kedgtc8sdh7xlcr77ydv3qu7fs2e3q6xznysp2lrdfyz9xyqv26yqv",
  ampOSMO: "osmo1cztgw4e467vjljd0s2flz8asu3x3wg9q0ttga9t6kzmpyaauxxrs2gjshq",
  bOSMO: "osmo159f7axyc32cyfgzx0gs9r98jwpgutj5qz4ns97xvu7nw3xzpavzsg2uxr3",
  qOSMO: "osmo18vk0rsu4qwzx74g9alu2f7x5zs99sluwkuh5wp70yed2ne4pmutqf9lvdu",
  usdcaxlGrid: "osmo1qngwlgzt0r3fdg6zgln5wa6mr5c7t6fek3qqgxesujjak5ds747sy6qu2f",
  // usdtGrid: "osmo1cj8tzmvun6urr0djrax7v92jyk86gnp8hsep0hacf83quvknq5lsutucjj",
  OSMORedemption: "osmo15fqmdl8lfl9h0qflljd63ufw9j2m7xmsk3hu5vsn8xpta4hk5chqt7mddc",
  TIARedemption: "osmo1reyz7pwu7y9e7lmzqg6j4h7jcv32du7n7jhnk2lz93a9lxr56ess2qtgzl",
  ATOMRedemption: "osmo1hvl5kj4xzdj4udxjv2dzk2zfqhzkd9afqygwq3t84tn53e0250zqrltj48",
}

const neutronVaults = {
  ATOMFund: "neutron1puedrclm6rn33x3zv66xg6m23qcdagayqua6jj2wqzvfznlqef8qe53wr2",
  NTRNStructured: "neutron13h4jzme5880knnc23xvwu9gytynnxu5cc0fek6fndmjyctzznj9sd5yhhy",
}

const config = {
  osmosis: osmosisVaults,
  neutron: neutronVaults,
}

module.exports = {
  methodology: 'Total TVL on vaults',
}

Object.keys(config).forEach(chain => module.exports[chain] = { tvl })

async function tvl(api) {
  const vaults = config[api.chain]
  for (const contract of Object.values(vaults)) {
    let vaultInfo = await queryContract({ contract, api, data: { 'info': {} }, });
    let totalAssets = await queryContract({ contract, api, data: { 'total_assets': {} }, });
    api.add(vaultInfo.base_token, totalAssets);
  }
}
