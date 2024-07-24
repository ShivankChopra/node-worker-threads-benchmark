import { createHash, randomBytes } from 'crypto';

const mineAndGetHashes = (noOfHashes: number, difficulty: number, seed: string): Array<string> => {
    const hashes: Array<string> = [];

    let nonce: bigint = 0n;

    while (hashes.length < noOfHashes) {
        const hash: string = createHash('sha256').update(`${Date.now()}${seed}${nonce.toString()}`).digest('hex');

        if (hash.substring(0, difficulty) === '0'.repeat(difficulty))
            hashes.push(hash);

        nonce++;
    }

    return hashes;
};

// main
(() => {
    const seed = randomBytes(5).toString('hex');

    const timeLabel = 'Generating hashes';
    console.time(timeLabel);

    const hashes = mineAndGetHashes(80, 5, seed);
    console.log(hashes);

    console.timeEnd(timeLabel);
})()