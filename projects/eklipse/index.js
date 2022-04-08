import { getTVL } from './src/tvl/tvl.service.js';

export async function fetch() {
    return await getTVL();
}
fetch();
