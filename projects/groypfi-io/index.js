/**
 * GroypFi — TVL adapter (DefiLlama/DefiLlama-Adapters -> projects/groypfi-io/index.js)
 *
 * TVL = protocol-owned liquidity on DeDust.io (CPMM v2 pools).
 *
 * DeDust CPMM v2 does NOT use LP jettons: each liquidity provider owns a
 * per-pool `Position` contract, derived from the pool via
 * `get_position_address(owner)`. For every (owner, pool) pair in the static
 * list below the adapter:
 *   1. Resolves the owner's Position contract for that pool and reads its
 *      `liquidity` via `get_position_data`.
 *   2. Reads the pool's `reserve_x` / `reserve_y` / `liquidity` via
 *      `get_pool_data` and credits the owner's pro-rata share of both sides.
 *
 * The pool list is static (no transaction scanning), so the adapter's cost is
 * constant over time and positions never get undercounted. Any RPC failure
 * throws instead of silently under-reporting TVL.
 *
 * Owner wallets:
 *   UQClgkR0eLgWAR0tZh8YbQyDqa-Jn5wUP1XHPLDB6RmAPySF
 *   UQDu4AiT__JKuqT0Znje0RoXIQMPcj4uIGYZme3UK4hFlE_Q
 *
 * Website: https://groypfi.io
 * Contact: zeuraph7@gmail.com
 */

const { get } = require("../helper/http");

const TON_API = "https://tonapi.io/v2";
const TON_CG_ID = "coingecko:the-open-network";

// GroypFi liquidity-owning wallets (raw form) -> DeDust CPMM v2 pools they LP into.
//   0:a582...803f = UQClgkR0eLgWAR0tZh8YbQyDqa-Jn5wUP1XHPLDB6RmAPySF
//   0:eee0...4594 = UQDu4AiT__JKuqT0Znje0RoXIQMPcj4uIGYZme3UK4hFlE_Q
const POSITIONS = {
  "0:a582447478b816011d2d661f186d0c83a9af899f9c143f55c73cb0c1e919803f": [
    "0:9a3e84e631bcf8e13a2ec02031771d65c5d92ef387927ffa0a4ada2883ece5c9",
    "0:fd4aae2d1404b14bad64da5bfa8031c862c178b34a173f1e6e252887ab3b5768",
    "0:8f5dfa5cfd6660db32e870b20dd3e63226e4b07ba57c18fb0f704957db78f508",
    "0:c5278fb8f825d49fb4d3b777b567b141a47ea590944fe665641ad19de5d1d9cc",
    "0:10b2d980192f6067481a44b1776e827d7b58113b2609d805346ba42c85c59d9f",
    "0:1211d99675da8950f7137ebaa3badaa9134201de93661d6992d323ae1713c7f4",
    "0:024ca5a8fd1735a2557fec3d88228ecfa124ca45fdcdfc7cbecd1c4d555a0b09",
    "0:5e0aa95dcd495499d4bd9589a7936487d4f16e4875cbd76eb76f0a9d931983f4",
    "0:3757d9bb254d21e5f2418e43f57fdaeeefef83e71c82cf9a5e420f3debad891c",
    "0:035637d7ece4773f5e03e7d778ee069f63411b27a9e592f23a4642cd9b3d3a5c",
    "0:ec0f50bdefcec004c94a5152630621d8acc36fe006e599fe5b66a2e1c163cb1c",
    "0:907d7d8ff63722d1b080ac30ea2bd798eb9d3cfa3b7bab7f6dc7718d27f53fa4",
    "0:9f936670542ba0969d998057c2db3dc52ce192faf9e7ca548db4b4805bf5aec2",
    "0:3ccb84f81eed1c0f5acc00044fa066ae82d2c9a4ec6b1920d04150fa9675b66f",
    "0:c446d48d2c21825a1d63359fbf96fa3cdfbd53d7f7e43f61b78ad2e8413898bc",
    "0:9f7501cb8177db6e5a1d267e21db954349cf5bc0c3b56ee3003f590ec737f2be",
    "0:48d6536891c4e9685f1df56f4a87138dfb40f6d3d69039ec5132b78480b57c74",
    "0:13537bae1aadb7e1533419222bb6aa997f4f91cbf7ed28054ddb8150c6b7ef9e",
    "0:e81c1cf4e54c30a68011dc716f383ca07793d827fa7b0812f23bd9a34b62391b",
    "0:9f6240076663f16cebd865df4c8cf709d9d34bb748357e5d721f82e415748fdd",
    "0:84da0bf87dad860ae39f8e5568401126ca66df1658a8f2a1b7c254b3e0e8dd04",
    "0:a969a76b63d6be0b5de68231d97cd88fc9cc99322123010b6ab72f2e1af479f4",
    "0:08d4e2f2ee6067f1084a39b64d02f7cce8ed7b7a44885c64c326794c2d98d059",
    "0:7cc88d92dcc0ed001d885174925970d10ee1260139b7123b8c1801cb04856f16",
    "0:cab6700ee664186948f13154b4930e38ad85c23b594e8f0ba0581a74f786affe",
    "0:3413ac6ade7c6433f0c5e66d84fd4d5696f2c5706f47ee4ea9b546dc088b983a",
    "0:4f5a9bc7428925689f7f5b0c4f9f5afb0d9abc3f2aba19019b6b138510b7a40e",
    "0:1b305912a9b5cd45161f38be8499dabb42bc761ed278b0add2883e4d98c58f89",
    "0:3a4fc96c5937a5660e9dbebd01a8bcf602bceab86554d05403b7835746c36826",
    "0:663ebb74742c9e076754677fa1a6eca2d5a89515417a821a5c6a8e8cd87b7ea0",
    "0:853738fe933c8f93227cd5ce877608644c8cf99502fe414bd06097b89a2eaac5",
    "0:c0c4f5e4b2d49f9f07b066caafc90b6af09dc188e46cdb720c2abb6e73b6f172",
    "0:aa33ddf7d20ce1d8fc368a85af0f6ea422ed890fcabb5a63918d78839c54ebf8",
    "0:d0a5c1a7531d15eb609a96b3adad6cbf0c34636f2e268025116c539139375bd2",
    "0:71f1326c1bd3a07e938982e54711ed2ce56b38d1304ce432340f2bc3a404f6a1",
    "0:346ad937ac77a8e5ede2b835882f13c264983c00cd9f9937197a096716d01ca6",
    "0:31d29b5abcdc5e0e40efd28b13ae1eab83aae161a2c8b81885eb1123bada6301",
    "0:3af1b3cf188b9a80fbe0eab893d67102c067ee41875439c81fc92d7c60362c05",
    "0:ea58d063aa0fc13257ab7002290bb4d8f534229f716496a24b5a7b374b9b7101",
    "0:a9bb48babbb752b89a669b54d265c0049e6b085d5eecd01f1fc2c742e85dce51",
    "0:8da0033931e8c7f4ecceea3775158d6a206a1f1b624d653a9a735653ec08fed7",
    "0:e22462082b8dfa515da0c6890df454e1e7aa65e2b01d566a5a75a0382808299d",
    "0:fc2208d20b2c244de0d8a8bb08fe91127c7a4facc2ac621ce13a57dea90b8129",
    "0:6d0e2075036981818ccea52ce6a531bf7a6a01c60c2977d34edf5401f97978c8",
    "0:43754b95c79f0ca95c6c59ff391998791719cbe4eee886fb9f8e5ec8bc6c442d",
    "0:0dbcebbf23e208cd2754c5bd53c639385d4fe33a1d2a2d79985df71aab1fdd6d",
    "0:c65f6abc4c85a3ffb85e2cda1db2a395ef3738da631eac8f4ac89cc4750bde52",
    "0:e07e59b15185617ee4aea856a6aebe7e8082ab9f0ed2637d1dac59e7ebb9bc7f",
    "0:15fdd87638d29ed3c0ac6d7600ef39f87b287cff986caf03e8ecaec16c31f2d7",
    "0:e78d60555c62f79374710d880630fb62c31d93181669ca7a9003f6b0c8191d5e",
    "0:0b7a984e1030d96a87efbb4f7e282f7c7cff2477c4c5205539a6b5503f6d7966",
    "0:2e5bd0c9799c498840a9804c8eae772b485726b11d534ae71abd141df5fb234b",
    "0:28af2befbc6e6e7acbe3a6341e865736e8ba29984811f59ddcb18c4918d39bec",
    "0:79e4602f16e7607b01d819ba863f043f20885c90dd6683ae5f3f10f1d12359d9",
    "0:bed2d8219386f3db05c2d91ce33edee2148666e0ccf947e19316cf8a1c3b4295",
    "0:d39bf62fd94a66f724b94a40f03bfc9042c30d5f7cdfe9a1bbdd41260de42c93",
    "0:adaebe5cf654f6452583bb666bc781b64ad394367fb3fb3adcfaced0d8058d0f",
    "0:305ac1fbf70e76dee7dd1239e040598e88ff164353be17530b328ae70a45099b",
    "0:881f32ab39886f74ac5b0d1588ec58d622a377e34f66694fcba7e16202116dd0",
    "0:e81aba402f8aa36d1284c5a18036b7b7f6587ffcfd6fb5599edd453f7983c3e6",
    "0:ab4b7bb0c28c265ca2a5306e32cd28fb384a5330556a8ce14c79384f27b77f9a",
    "0:660dee0fc430c4a3c04f2cad628b97557af29eeccb7158f28ab8ddd5922e2560",
    "0:41888b36ac357929337938bbf99570dea9d66e3c371aa00f827f6e954171f639",
    "0:a9c9570862c3e53b01b7718a053138fbb9e127bff96b063d6416794e66214531",
    "0:991969d74d10828af48a250ff925fa396b2431cd421b928620d4a58249ca246f",
    "0:a0fab82a2e2b9eade27490a658e584482252a40fdb0c7e4e4ae49b3ffac04fe4",
  ],
  "0:eee00893fff24abaa4f46678ded11a1721030f723e2e20661999edd42b884594": [
    "0:916631aa418e98c57e26ddbff11f84b2b04037cfe2974fefe431fc88ee76df0d",
    "0:ddab47a648f0a7fc1161e480f99f42d6eca25fe93a0b8d85742f942c7805a3cd",
    "0:a88bfb34fd336bfb6996004c7e5088dfd84a56b6865ba1c5fb58f827f8d7fcf4",
    "0:7527a8a2c028f5be4075bc233243be320e2ccedd17a24c6763de6c98e4763b32",
    "0:1da8309d4b86377982068383e78ec76b4625ea27f16c7e47a51776b0976eb39b",
    "0:264e943d2ec56b608a54c7e93859cc2af52c4eefb0be3f91f151330612075e28",
    "0:0fbaf908a47f64ce9f98d0f8009f961c8b99b45b48c989706837b33da06e66c2",
    "0:9dfdb0621834c8fc808b86ae2d7ad9c3fa8cbd1a87a2aea26996b8118fffcfb8",
  ],
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function safeGet(url, tries = 4) {
  let lastError;
  for (let i = 0; i < tries; i++) {
    try {
      return await get(url);
    } catch (e) {
      lastError = e;
      await sleep(800 * (i + 1));
    }
  }
  throw new Error(`groypfi: TonAPI request failed (${url}): ${lastError && lastError.message}`);
}

async function tvl(api) {
  for (const [owner, pools] of Object.entries(POSITIONS)) {
    for (const pool of pools) {
      const posRes = await safeGet(
        `${TON_API}/blockchain/accounts/${pool}/methods/get_position_address?args=${owner}`,
      );
      const posAddr = posRes && posRes.decoded && posRes.decoded.position_address;
      if (!posAddr) throw new Error(`groypfi: no position address for ${owner} in pool ${pool}`);

      const posData = await safeGet(
        `${TON_API}/blockchain/accounts/${posAddr}/methods/get_position_data`,
      );
      // A closed position can return an unsuccessful get-method result.
      if (!posData || !posData.success) continue;

      // stack: poolAddress, ownerAddress, liquidity, lockedLiquidity, ...
      const liqRaw = posData.stack && posData.stack[2] && posData.stack[2].num;
      if (!liqRaw) continue;
      const liquidity = BigInt(liqRaw);
      if (liquidity <= 0n) continue;

      const poolData = await safeGet(
        `${TON_API}/blockchain/accounts/${pool}/methods/get_pool_data`,
      );
      const d = poolData && poolData.decoded;
      if (!d) throw new Error(`groypfi: get_pool_data failed for pool ${pool}`);

      const total = BigInt(d.liquidity || "0");
      if (total <= 0n) continue;

      // asset_x is native TON (empty address), asset_y is a jetton master
      const reserveX = BigInt(d.reserve_x || "0");
      const reserveY = BigInt(d.reserve_y || "0");

      if (reserveX > 0n) {
        const tonAmount = Number((reserveX * liquidity) / total) / 1e9;
        api.add(TON_CG_ID, tonAmount, { skipChain: true });
      }
      if (reserveY > 0n && d.asset_y) {
        api.add(`ton:${d.asset_y}`, ((reserveY * liquidity) / total).toString());
      }

      await sleep(120);
    }
  }
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  doublecounted: true,
  methodology:
    "TVL counts GroypFi's protocol-owned liquidity on DeDust.io CPMM v2 pools. For each protocol wallet and each pool it provides liquidity to (static list), the wallet's Position contract liquidity is read on-chain and converted into a pro-rata share of the pool's reserves, priced in USD.",
  ton: { tvl },
};
