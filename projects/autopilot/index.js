const ADDRESSES = require('../helper/coreAssets.json')
const { unwrapSolidlyVeNft } = require('../helper/unwrapLPs');

const AERO = ADDRESSES.base.AERO;
const veAero = '0xeBf418Fe2512e7E6bd9b87a8F0f294aCDC67e6B4';
const VAULT_ADDRESS = '0xA7c68a960bA0F6726C4b7446004FE64969E2b4d4';

async function tvl(api) {
    await unwrapSolidlyVeNft({
        api,
        baseToken: AERO,
        veNft: veAero,
        owner: VAULT_ADDRESS
    });
    return
}

module.exports = {
    timetravel: true,
    start: '2025-07-21',
    methodology: `TVL is comprised of veAero NFTs locked in the autopilot vault`,
    base: { tvl: tvl }
}