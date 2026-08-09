const startTime = performance.now();

const mockUpload = async (title) => {
    return new Promise(resolve => setTimeout(() => resolve(title), 500));
}

const localDrafts = Array.from({length: 5}).map((_, i) => ({ title: `Draft ${i}` }));

async function runSequential() {
    const start = performance.now();
    for (const draft of localDrafts) {
        await mockUpload(draft.title);
    }
    console.log(`Sequential took: ${performance.now() - start}ms`);
}

async function runParallel() {
    const start = performance.now();
    const promises = localDrafts.map(async (draft) => {
        await mockUpload(draft.title);
    });
    await Promise.all(promises);
    console.log(`Parallel took: ${performance.now() - start}ms`);
}

async function main() {
    await runSequential();
    await runParallel();
}

main();
