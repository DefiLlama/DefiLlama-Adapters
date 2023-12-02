const ADDRESSES = require('../helper/coreAssets.json')
const { getProvider, getSolBalances, } = require('../helper/solana')
const { Program, } = require("@project-serum/anchor");
const { getConfig } = require('../helper/cache')
const { bs58 } = require('@project-serum/anchor/dist/cjs/utils/bytes');
const { Connection, Keypair } = require('@solana/web3.js');
const { AnchorProvider: Provider, Wallet, } = require("@project-serum/anchor");

let data

async function getData() {
    if (!data) data = getAllData()
    return data


    async function getAllData() {
        const programId = '4tdmkuY6EStxbS6Y8s5ueznL3VPMSugrvQuDeAHGZhSt'
        const provider = getBanxProvider()
        const idl = await getConfig('banx-idl', 'https://raw.githubusercontent.com/frakt-solana/banx-public-sdk/master/src/fbond-protocol/idl/bonds.json')
        const program = new Program(idl, programId, provider)

        const fraktBondsOffset = 8;
        const bondOfferOffset = 32 + 8;
        const [
            fraktBonds,
            bondOffers,
        ] = await Promise.all([
            getFilteredAccounts(program, 'fraktBond', fraktBondsOffset, [5,]),
            getFilteredAccounts(program, 'bondOfferV2', bondOfferOffset, [5, 7,]),

        ])

        const offersSum = bondOffers.reduce((acc, offer) => acc + (+offer.account.fundsSolOrTokenBalance) + Math.max(0, +offer.account.bidSettlement), 0)

        const borrowedSum = fraktBonds.reduce((acc, bond) => acc + bond.account.borrowedAmount.toNumber(), 0)


        return { tvl: offersSum + borrowedSum }
    }
}

const tvl = async () => {
    return { ['solana:' + ADDRESSES.solana.SOL]: (await getData()).tvl }
};

function getBanxProvider() {
    const dummy_keypair = Keypair.generate();
    const wallet = new Wallet(dummy_keypair);
  
    const provider = new Provider(
        new Connection("https://mainnet.helius-rpc.com/?api-key=edc01bc7-f50a-4750-bb57-0faab1c50800"), wallet
      );
    return provider;
}



const getFilteredAccounts = async (
    program,
    accountName,
    offset,
    indexes
) => {
    return (
        await Promise.all(
            indexes.map((i) =>
                program.account[accountName].all([
                    {
                        memcmp: {
                            offset: offset, // number of bytes
                            bytes: bs58.encode(Buffer.from([i])), // PerpetualActive
                        },
                    },
                ]),
            ),
        )
    ).flat();
};


module.exports = {
    timetravel: false,
    methodology: 'OffersSum is sum of sol in pools not yet lent out. The borrowedSum is the sum of SOL which has been borrowed and overcollaterized by the value of locked NFTs. The TVL = offersSum + borrowedSum',
    solana: {
        tvl,
    }
};
