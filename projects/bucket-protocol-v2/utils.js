const { queryEvents, getObjects } = require("../helper/chain/sui");
const ADDRESSES = require("../helper/coreAssets.json");

function parseTypeTag(type){
	if (!type.includes('::')) return type;

	return parseStructTag(type);
}

function splitGenericParameters(
	str,
	genericSeparators= ['<', '>'],
) {
	const [left, right] = genericSeparators;
	const tok = [];
	let word = '';
	let nestedAngleBrackets = 0;

	for (let i = 0; i < str.length; i++) {
		const char = str[i];
		if (char === left) {
			nestedAngleBrackets++;
		}
		if (char === right) {
			nestedAngleBrackets--;
		}
		if (nestedAngleBrackets === 0 && char === ',') {
			tok.push(word.trim());
			word = '';
			continue;
		}
		word += char;
	}

	tok.push(word.trim());

	return tok;
}

function normalizeSuiAddress(value, forceAdd0x = false){
	let address = value.toLowerCase();
	if (!forceAdd0x && address.startsWith('0x')) {
		address = address.slice(2);
	}
	return `0x${address.padStart(32 * 2, '0')}`;
}

function parseStructTag(type) {
	const [address, module] = type.split('::');

	const rest = type.slice(address.length + module.length + 4);
	const name = rest.includes('<') ? rest.slice(0, rest.indexOf('<')) : rest;
	const typeParams = rest.includes('<')
		? splitGenericParameters(rest.slice(rest.indexOf('<') + 1, rest.lastIndexOf('>'))).map(
				(typeParam) => parseTypeTag(typeParam.trim()),
			)
		: [];

	return {
		address: normalizeSuiAddress(address),
		module,
		name,
		typeParams,
	};
}

function normalizeStructTag(type) {
	const { address, module, name, typeParams } =
		typeof type === 'string' ? parseStructTag(type) : type;

	const formattedTypeParams =
		typeParams?.length > 0
			? `<${typeParams
					.map((typeParam) =>
						typeof typeParam === 'string' ? typeParam : normalizeStructTag(typeParam),
					)
					.join(',')}>`
			: '';

	return `${address}::${module}::${name}${formattedTypeParams}`;
}

async function getAllVaultIds() {
   const newVaultEventType =
  "0x9f835c21d21f8ce519fec17d679cd38243ef2643ad879e7048ba77374be4036e::events::VaultCreated";
  const res = await queryEvents({eventType: newVaultEventType});

  const collTypes = res.map((d) =>
    normalizeStructTag(d.coll_type),
  );
  const vaultIds = res.map((d) => d.vault_id);
  const vaultRes = await getObjects(vaultIds);
  return vaultRes.reduce((acc, vault, idx) => {
    if (collTypes[idx]) {
      acc[collTypes[idx]] = vault.fields.id.id
    }
    return acc
  },{});
}

async function getAllPoolIds() {
   const newPSMPoolEventType =
  "0xc2ae6693383e4a81285136effc8190c7baaf0e75aafa36d1c69cd2170cfc3803::events::NewPsmPool";
  const res = await queryEvents({eventType: newPSMPoolEventType});

  const collTypes = res.map((d) =>
    normalizeStructTag(d.coin_type),
  );
  const poolIds = res.map((d) => d.pool_id);
  const poolRes = await getObjects(poolIds);
  return poolRes.reduce((acc, pool, idx) => {
    if (collTypes[idx]) {
      acc[collTypes[idx]] = pool.fields.id.id
    }
    return acc
  },{});
}

function mappingTokenAsset(type){
    switch (type) {
        case '0x2f2226a22ebeb7a0e63ea39551829b238589d981d1c6dd454f01fcc513035593::house::StakedHouseCoin<0x5de877a152233bdd59c7269e2b710376ca271671e9dd11076b1ff261b2fd113c::up_usd::UP_USD>':
            return ADDRESSES.sui.USDC
        case '0x2f2226a22ebeb7a0e63ea39551829b238589d981d1c6dd454f01fcc513035593::house::StakedHouseCoin<0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI>':
            return ADDRESSES.sui.SUI
        case '0xb14f82d8506d139eacef109688d1b71e7236bcce9b2c0ad526abcd6aa5be7de0::scallop_sb_eth::SCALLOP_SB_ETH':
            return ADDRESSES.sui.ETH
        case '0xeb7a05a3224837c5e5503575aed0be73c091d1ce5e43aa3c3e716e0ae614608f::scallop_deep::SCALLOP_DEEP':
            return ADDRESSES.sui.DEEP
        case '0x622345b3f80ea5947567760eec7b9639d0582adcfd6ab9fccb85437aeda7c0d0::scallop_wal::SCALLOP_WAL':
            return ADDRESSES.sui.WAL
        case '0xb1d7df34829d1513b73ba17cb7ad90c88d1e104bb65ab8f62f13e0cc103783d3::scallop_sb_usdt::SCALLOP_SB_USDT':
            return ADDRESSES.sui.USDT
        case '0x854950aa624b1df59fe64e630b2ba7c550642e9342267a33061d59fb31582da5::scallop_usdc::SCALLOP_USDC':
            return ADDRESSES.sui.USDC
        case '0xaafc4f740de0dd0dde642a31148fb94517087052f19afb0f7bed1dc41a50c77b::scallop_sui::SCALLOP_SUI':
            return ADDRESSES.sui.SUI
        case '0x876a4b7bce8aeaef60464c11f4026903e9afacab79b9b142686158aa86560b50::xbtc::XBTC':
            return ADDRESSES.sui.BTC
		case '0x7438e8caf5c345fbd3772517380bf0ca432f53892dee65ee0dda3eb127993cd9::bfbtc::BFBTC':
            return ADDRESSES.sui.BTC
		case '0x0041f9f9344cac094454cd574e333c4fdb132d7bcc9379bcd4aab485b2a63942::wbtc::WBTC':
			return ADDRESSES.sui.BTC
        default:
            return type
    }
}

module.exports = {
	parseStructTag,
	getAllVaultIds,
	getAllPoolIds,
	mappingTokenAsset
}
