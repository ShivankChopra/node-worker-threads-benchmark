import { createHash, randomBytes } from 'crypto';
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';

if (isMainThread) {
    const mineHashesWorkerThread = (noOfHashes: number, difficulty: number, seed: string) => {
        return new Promise((resolve, reject) => {
            const worker = new Worker(__filename, { workerData: { noOfHashes, difficulty, seed } });
            worker.on('error', reject);
            worker.on('message', resolve);
            worker.on('exit', () => reject('Worker exited!'));
        });
    };

    // main
    (async () => {
        const seed = randomBytes(5).toString('hex');

        const hashes = await mineHashesWorkerThread(5, 5, seed);

        console.log(hashes);
    })()
} else {
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

    const { noOfHashes, difficulty, seed } = workerData;
    const hashes = mineAndGetHashes(noOfHashes, difficulty, seed);

    parentPort?.postMessage(hashes);
}