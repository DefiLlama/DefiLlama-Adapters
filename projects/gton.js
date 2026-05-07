const ADDRESSES = require('./helper/coreAssets.json')
const { sumTokensExport, nullAddress } = require("./helper/unwrapLPs");
const { staking } = require('./helper/staking')

const gton = "0xC1Be9a4D5D45BeeACAE296a7BD5fADBfc14602C4".toLowerCase();
const stakingContract = "0xB0dAAb4eb0C23aFFaA5c9943d6f361b51479ac48";
const treasury = "0xB3D22267E7260ec6c3931d50D215ABa5Fd54506a";
const chain = 'fantom'

module.exports = {
    fantom: {
        tvl: sumTokensExport({ chain, owner: treasury, tokens: [
            nullAddress,
            '0xddcb3ffd12750b45d32e084887fdf1aabab34239',
            '0x841fad6eae12c286d1fd18d1d525dffa75c7effe',
            '0x5cc61a78f164885776aa610fb0fe1257df78e59b',
            ADDRESSES.fantom.WFTM,
            '0xb688e18f34e6e424c44b247318f22367ed7df3e2',
            ADDRESSES.fantom.renBTC,
            '0x1E4F97b9f9F913c46F1632781732927B9019C68b',
            '0x657A1861c15A3deD9AF0B6799a195a249ebdCbc6',
            '0xc3f069d7439baf6d4d6e9478d9cc77778e62d147',
            ADDRESSES.fantom.fUSDT,
            '0xf16e81dce15b08f326220742020379b855b87df9',
        ]}),
        staking: staking([stakingContract, treasury,], gton),
    }
};