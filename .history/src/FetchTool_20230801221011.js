// ??? !!!
// const {scratchFetch} = require('./scratchFetch');

// /**
//  * @typedef {Request & {withCredentials: boolean}} ScratchSendRequest
//  */


// !!!!
// !!! ???
/* eslint-env browser */

const saferFetchAsArrayBuffer = require('./safer-fetch');


/**
 * Get and send assets with the fetch standard web api.
 */
class FetchTool {
    // /**
    //  * Is get supported?
    //  * Always true for `FetchTool` because `scratchFetch` ponyfills `fetch` if necessary.
    //  * @returns {boolean} Is get supported?
    //  */
    // get isGetSupported () {
    //     return true;
    // }


    // !!!!
    /**
     * Is get supported? false if the environment does not support fetch.
     * @returns {boolean} Is get supported?
     */
    get isGetSupported () {
        return typeof fetch !== 'undefined';
    }


    // /**
    //  * Request data from a server with fetch.
    //  * @param {Request} reqConfig - Request configuration for data to get.
    //  * @returns {Promise.<Uint8Array?>} Resolve to Buffer of data from server.
    //  */


    // !!!!
    /**
     * Request data from a server with fetch.
     * @param {{url:string}} reqConfig - Request configuration for data to get.
     * @param {{method:string}} options - Additional options to configure fetch.
     * @returns {Promise.<Uint8Array>} Resolve to Buffer of data from server.
     */
    get ({url, ...options}) {
        // return scratchFetch(url, Object.assign({method: 'GET'}, options))
        //     .then(result => {
        //         if (result.ok) return result.arrayBuffer().then(b => new Uint8Array(b));
        //         if (result.status === 404) return null;
        //         return Promise.reject(result.status); // TODO: we should throw a proper error


        // !!!!
        return saferFetchAsArrayBuffer(url, Object.assign({method: 'GET'}, options))
            .then(arrayBufferOrNull => {
                if (arrayBufferOrNull) {
                    return new Uint8Array(arrayBufferOrNull);
                }
                return arrayBufferOrNull;
            });
    }

    /**
     * Is sending supported?
     * Always true for `FetchTool` because `scratchFetch` ponyfills `fetch` if necessary.
     * @returns {boolean} Is sending supported?
     */
    get isSendSupported () {
        return true;
    }

    /**
     * Send data to a server with fetch.
     * @param {ScratchSendRequest} reqConfig - Request configuration for data to send.
     * @returns {Promise.<string>} Server returned metadata.
     */
    send ({url, withCredentials = false, ...options}) {
        return scratchFetch(url, Object.assign({
            credentials: withCredentials ? 'include' : 'omit'
        }, options))
            .then(response => {
                if (response.ok) return response.text();
                return Promise.reject(response.status);
            });
    }
}

module.exports = FetchTool;
