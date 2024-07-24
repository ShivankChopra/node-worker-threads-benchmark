const os = require('os');
const crypto = require('crypto');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

if (isMainThread) {
    const mineHashesWorkerThread = (noOfHashes, difficulty, seed) => {
        return new Promise((resolve, reject) => {
            const worker = new Worker(__filename, { workerData: { noOfHashes, difficulty, seed } });
            worker.on('error', reject);
            worker.on('message', resolve);
            worker.on('exit', () => reject('Worker exited!'));
        });
    };

    // main
    (async () => {
        const timeLabel = 'Generating hashes';
        console.time(timeLabel);

        const noOfCpus = os.cpus().length;
        const hashesPerCpu = 80 / noOfCpus;

        const promises = [], hashes = [];

        for (let i = 0; i < noOfCpus; i++) {
            const seed = crypto.randomBytes(5).toString('hex');
            const promise = mineHashesWorkerThread(hashesPerCpu, 5, seed);
            promise.then(hashesResult => hashes.push(...hashesResult));
            promises.push(promise);
        }

        await Promise.all(promises);

        console.log(hashes);

        console.timeEnd(timeLabel);
    })();
} else {
    const mineAndGetHashes = (noOfHashes, difficulty, seed) => {
        const hashes = [];

        let nonce = BigInt(0);

        while (hashes.length < noOfHashes) {
            const hash = crypto.createHash('sha256').update(`${Date.now()}${seed}${nonce.toString()}`).digest('hex');

            if (hash.substring(0, difficulty) === '0'.repeat(difficulty))
                hashes.push(hash);

            nonce++;
        }

        return hashes;
    };

    const { noOfHashes, difficulty, seed } = workerData;
    const hashes = mineAndGetHashes(noOfHashes, difficulty, seed);

    if (parentPort) {
        parentPort.postMessage(hashes);
    }
}