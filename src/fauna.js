// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import { NetworkError } from "fauna";


export class FastlyFetchClient {
  #url;
  #backend;
  #options;

  constructor(url, backend, options) {
    this.#url = new URL("/query/1", url).toString();
    this.#backend = backend;
    this.#options = options;
  }

  async request({
    data,
    headers: requestHeaders,
    method
  }) {
    const response = await fetch(this.#url, {
      method,
      headers: { ...requestHeaders, "Content-Type": "application/json" },
      body: JSON.stringify(data),
      backend: this.#backend,
      ...this.#options
    }).catch((error) => {
      throw new NetworkError("The network connection encountered a problem.", {
        cause: error,
      });
    });

    const status = response.status;

    const responseHeaders = {};
    response.headers.forEach((value, key) => (responseHeaders[key] = value));

    const body = await response.text();

    return {
      status,
      body,
      headers: responseHeaders,
    };  
  }

  close() {
    // no actions at this time
  }
  
}


