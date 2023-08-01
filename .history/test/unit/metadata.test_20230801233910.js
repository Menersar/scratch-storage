// jest.mock('cross-fetch');

// beforeEach(() => {
//     // reset the metadata container to ensure the tests don't interfere with each other
//     // but this also means we need to `require` inside the tests
//     /* eslint-disable global-require */
//     jest.resetModules();
// });

// test('get without metadata', async () => {
//     const FetchTool = require('../../src/FetchTool.js');
//     const tool = new FetchTool();

//     const mockFetchTestData = {};
//     const result = await tool.get({url: '200', mockFetchTestData});

//     expect(result).toBeInstanceOf(Uint8Array);
//     expect(mockFetchTestData.headers).toBeTruthy();
//     expect(mockFetchTestData.headersCount).toBe(0);
// });

// test('get with metadata', async () => {
//     const FetchTool = require('../../src/FetchTool.js');
//     const ScratchFetch = require('../../src/scratchFetch');
//     const {RequestMetadata, setMetadata} = ScratchFetch;

//     const tool = new FetchTool();

//     setMetadata(RequestMetadata.ProjectId, 1234);
//     setMetadata(RequestMetadata.RunId, 5678);

//     const mockFetchTestData = {};
//     const result = await tool.get({url: '200', mockFetchTestData});

//     expect(result).toBeInstanceOf(Uint8Array);
//     expect(mockFetchTestData.headers).toBeTruthy();
//     expect(mockFetchTestData.headersCount).toBe(2);
//     expect(mockFetchTestData.headers?.get(RequestMetadata.ProjectId)).toBe('1234');
//     expect(mockFetchTestData.headers?.get(RequestMetadata.RunId)).toBe('5678');
// });

// test('send without metadata', async () => {
//     const FetchTool = require('../../src/FetchTool.js');
//     const tool = new FetchTool();

//     const mockFetchTestData = {};
//     const result = await tool.send({url: '200', mockFetchTestData});

//     expect(typeof result).toBe('string');
//     expect(mockFetchTestData.headers).toBeTruthy();
//     expect(mockFetchTestData.headersCount).toBe(0);
// });

// test('send with metadata', async () => {
//     const FetchTool = require('../../src/FetchTool.js');
//     const ScratchFetch = require('../../src/scratchFetch');
//     const {RequestMetadata, setMetadata} = ScratchFetch;

//     const tool = new FetchTool();

//     setMetadata(RequestMetadata.ProjectId, 4321);
//     setMetadata(RequestMetadata.RunId, 8765);

//     const mockFetchTestData = {};
//     const result = await tool.send({url: '200', mockFetchTestData});

//     expect(typeof result).toBe('string');
//     expect(mockFetchTestData.headers).toBeTruthy();
//     expect(mockFetchTestData.headersCount).toBe(2);
//     expect(mockFetchTestData.headers?.get(RequestMetadata.ProjectId)).toBe('4321');
//     expect(mockFetchTestData.headers?.get(RequestMetadata.RunId)).toBe('8765');
// });

// test('selectively delete metadata', async () => {
//     const FetchTool = require('../../src/FetchTool.js');
//     const ScratchFetch = require('../../src/scratchFetch');
//     const {RequestMetadata, setMetadata, unsetMetadata} = ScratchFetch;

//     // verify that these special values are preserved and not interpreted as "delete"
//     setMetadata(RequestMetadata.ProjectId, null);
//     setMetadata(RequestMetadata.RunId, void 0); // void 0 = undefined

//     const tool = new FetchTool();

//     const mockFetchTestData = {};

//     const result1 = await tool.send({url: '200', mockFetchTestData});
//     expect(typeof result1).toBe('string');
//     expect(mockFetchTestData.headers).toBeTruthy();

//     expect(mockFetchTestData.headersCount).toBe(2);
//     expect(mockFetchTestData.headers?.get(RequestMetadata.ProjectId)).toBe('null'); // string "null" means it's present
//     expect(mockFetchTestData.headers?.get(RequestMetadata.RunId)).toBe('undefined');

//     // remove the Project ID from metadata
//     unsetMetadata(RequestMetadata.ProjectId);

//     const result2 = await tool.send({url: '200', mockFetchTestData});
//     expect(typeof result2).toBe('string');
//     expect(mockFetchTestData.headers).toBeTruthy();

//     expect(mockFetchTestData.headersCount).toBe(1);
//     expect(mockFetchTestData.headers?.get(RequestMetadata.ProjectId)).toBeNull(); // value `null` means it's present
//     expect(mockFetchTestData.headers?.get(RequestMetadata.RunId)).toBe('undefined');
// });

// test('metadata has case-insensitive keys', async () => {
//     const FetchTool = require('../../src/FetchTool.js');
//     const ScratchFetch = require('../../src/scratchFetch');
//     const {setMetadata} = ScratchFetch;

//     setMetadata('foo', 1);
//     setMetadata('FOO', 2);

//     const tool = new FetchTool();

//     const mockFetchTestData = {};
//     await tool.get({url: '200', mockFetchTestData});

//     expect(mockFetchTestData.headers).toBeTruthy();
//     expect(mockFetchTestData.headersCount).toBe(1);
//     expect(mockFetchTestData.headers?.get('foo')).toBe('2');
// });


const test = require('tap').test;
const FetchTool = require('../../src/FetchTool');

test('get() returns success for status: 0, ok: false', t => {
    const text = 'successful response';
    const encoding = 'utf-8';
    const encoded = new TextEncoder().encode(text);
    const decoder = new TextDecoder(encoding);

    global.fetch = () => Promise.resolve({
        // This is what fetch() resolves with in a WKWebView when requesting a file: URL from a file: URL.
        ok: false,
        status: 0,
        arrayBuffer: () => Promise.resolve(encoded.buffer)
    });

    const tool = new FetchTool();

    return t.resolves(
        tool.get({url: 'url'}).then(result => {
            t.equal(decoder.decode(result), text);
        })
    );
});

test('get() retries on error', t => {
    const text = 'successful response';
    const encoding = 'utf-8';
    const encoded = new TextEncoder().encode(text);
    const decoder = new TextDecoder(encoding);

    let attempt = 0;
    global.fetch = () => {
        attempt++;
        if (attempt === 1) {
            // eslint-disable-next-line prefer-promise-reject-errors
            return Promise.reject('Intentional error for testing');
        }
        return Promise.resolve({
            ok: true,
            arrayBuffer: () => Promise.resolve(encoded.buffer)
        });
    };

    const tool = new FetchTool();
    return t.resolves(
        tool.get({url: 'url'}).then(result => {
            t.equal(decoder.decode(result), text);
        })
    );
});
