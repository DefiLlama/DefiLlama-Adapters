const { sumTokensExport, sumTokens2 } = require("../helper/chain/cardano");
const { getAssets } = require("../helper/chain/cardano/blockfrost");

const V1_POOL_SCRIPT_HASH = "script1uychk9f04tqngfhx4qlqdlug5ntzen3uzc62kzj7cyesjk0d9me"
const V1_ORDER_SCRIPT_HASH = "script15ew2tzjwn364l2pszu7j5h9w63v2crrnl97m074w9elrkxhah0e"

const V2_POOL_SCRIPT_HASH = "script1agrmwv7exgffcdu27cn5xmnuhsh0p0ukuqpkhdgm800xksw7e2w"
const V2_ORDER_SCRIPT_HASH = "script1c03gcdkrg3e3twj62menmf4xmhqhwz58d2xe7r9n497yc6r9qhd"

async function tvl() {
  // DEX V1
  const v1LiquidityPoolAssets = await getAssets(V1_POOL_SCRIPT_HASH)
  const v1BatchOrderAssets = await getAssets(V1_ORDER_SCRIPT_HASH)

  // DEX V2
  const v2LiquidityPoolAssets = await getAssets(V2_POOL_SCRIPT_HASH)
  const v2BatchOrderAssets = await getAssets(V2_ORDER_SCRIPT_HASH)

  // Stable pools
  const [
    USDMUSDA,
    USDMDJED,
    USDMIUSD,
    USDCIUSD,
    DJEDIUSD,
    USDCDJED,
    IUSDUSDA
  ] = await Promise.all([
    getAssets('addr1wywdvw0qwv2n97e8y5jsfqq3qryu6re3gxwqcc7fzscpwugxz5dwe'),
    getAssets('addr1wxxdvtj6y4fut4tmu796qpvy2xujtd836yg69ahat3e6jjcelrf94'),
    getAssets('addr1w9520fyp6g3pjwd0ymfy4v2xka54ek6ulv4h8vce54zfyfcm2m0sm'),
    getAssets('addr1wx4w03kq5tfhaad2fmglefgejj0anajcsvvg88w96lrmylc7mx5rm'),
    getAssets('addr1wy7kkcpuf39tusnnyga5t2zcul65dwx9yqzg7sep3cjscesx2q5m5'),
    getAssets('addr1wx8d45xlfrlxd7tctve8xgdtk59j849n00zz2pgyvv47t8sxa6t53'),
    getAssets('addr1wyge54qpez2zc250f8frwtksjzrg4l6n5cs34psqas9uz0syae9sf')
  ]);

  const stablePoolAssets = [
    USDMUSDA,
    USDMDJED,
    USDMIUSD,
    USDCIUSD,
    DJEDIUSD,
    USDCDJED,
    IUSDUSDA
  ].flat();

  const combinedAssets = [
    ...v1LiquidityPoolAssets,
    ...v1BatchOrderAssets,
    ...v2LiquidityPoolAssets,
    ...v2BatchOrderAssets,
    ...stablePoolAssets
  ].reduce((acc, asset) => {
    const existingAsset = acc.find(a => a.unit === asset.unit);

    if (existingAsset) {
      existingAsset.quantity = (BigInt(existingAsset.quantity) + BigInt(asset.quantity)).toString();
    } else {
      acc.push({ ...asset });
    }

    return acc;
  }, []);

  const formattedAssets = combinedAssets.reduce((acc, asset) => {
    const assetId = `cardano:${asset.unit}`;
    acc[assetId] = asset.quantity;
    return acc;
  }, {});

  return formattedAssets
}

module.exports = {
  timetravel: false,
  cardano: {
    tvl,
    staking: sumTokensExport({
      owner: 'addr1wy3fscaws62d59k6qqhg3xsarx7vstzczgjmdhx2jh7knksj7w3y7',
      tokens: ['29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c64d494e']
    })
  },
  hallmarks: [
    [1647949370, "Vulnerability Found"],
    [1712565661, "Stableswap Launch"],
    [1720584000, "V2 Launch"]
  ],
};
