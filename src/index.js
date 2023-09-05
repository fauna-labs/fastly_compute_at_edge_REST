// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import { CacheOverride } from "fastly:cache-override";
import { ConfigStore } from "fastly:config-store";
import { Client, fql } from "fauna";
import { FastlyFetchClient } from './fauna';

addEventListener("fetch", (event) => event.respondWith(handleRequest(event)));


async function handleRequest(event) {
  const req = event.request;
  const method = req.method;
  const requestUrl = new URL(event.request.url);
  const pathname = requestUrl.pathname;

  const dict = new ConfigStore("fauna_env_variables");
  const secret = dict.get("FAUNA_ACCESS_KEY");
  const url = "https://db.fauna.com";
  const backend = "fauna";

  // e.g. GET /
  // Makes a simple call to Fauna. Returns "Hello World" if successfully connected to the database
  if (method == "GET" && pathname == "/") {
    try {
      // Can pass in fetch options like this
      const cacheOverride = new CacheOverride("override", { ttl: 60 });
      const options = { cacheOverride }

      const client = new Client({ secret }, new FastlyFetchClient(url, backend, options));
      const res = await client.query(fql`
        let helloWorld = "Hello " + "World"
        helloWorld    
      `);

      client.close();

      return new Response(
        JSON.stringify(res.data, null, 2), 
        { status: 200 }
      );
    } catch(err) {
      return new Response(
        err.queryInfo.summary,
        { status: err.httpStatus }
      );
    }
  }

  if (method == "GET" && pathname.match("^\/inventory\/?$")) {
    try {
      const client = new Client({ secret }, new FastlyFetchClient(url, backend));

      const query = fql`Inventory.all() { id, item, quantity, price }`;

      const res = await client.query(query);
      client.close();

      return new Response(
        JSON.stringify(res.data.data, null, 2), 
        { status: res.httpStatus }
      );
    } catch(err) {
      return new Response(
        err.queryInfo.summary,
        { status: err.httpStatus }
      );
    }   
  }

  if (method == "GET" && pathname.match(`\/inventory\/[^\/]+(\/)?$`)) {
    try {
      const client = new Client({ secret }, new FastlyFetchClient(url, backend));

      const id = decodeURI(pathname.split('/')[2]);
      const query = fql`Inventory.byId(${id}) { id, item, quantity, price }`;

      const res = await client.query(query);
      client.close();

      if (res.data === null) {
        return new Response("id not found", {status: 404});
      } else {
        return new Response(
          JSON.stringify(res.data, null, 2), 
          { status: res.httpStatus }
        );  
      }
    } catch(err) {
      return new Response(
        err.queryInfo.summary,
        { status: err.httpStatus }
      );
    }   
  }

  if (method == "POST" && pathname.match("^\/inventory\/?$")) {
    try {
      const requestPostData = await event.request.json();
      const item = requestPostData.item;
      const quantity = requestPostData.quantity;
      const price = requestPostData.price;

      const client = new Client({ secret }, new FastlyFetchClient(url, backend));

      const query = fql`
        Inventory.create({
          item: ${item}, 
          quantity: ${quantity}, 
          price: ${price}
        }) { id, item, quantity, price }
      `;

      const res = await client.query(query);
      client.close();

      return new Response(
        `A new item has been added to the inventory: ${JSON.stringify(res.data)}`, 
        { status: res.httpStatus }
      );
    } catch(err) {
      return new Response(
        err.queryInfo.summary,
        { status: err.httpStatus }
      );
    }   
  }

  if (method == "PUT" && pathname.match(`\/inventory\/[^\/]+(\/)?$`)) {
    try {
      const requestPutData = await event.request.json();
      const item = requestPutData.item;
      const quantity = requestPutData.quantity;
      const price = requestPutData.price;
      const id = decodeURI(pathname.split('/')[2]);

      const client = new Client({ secret }, new FastlyFetchClient(url, backend));

      const query = fql`
      let itemToUpdate = Inventory.byId(${id});
      itemToUpdate?.update({
          item: ${item},
          quantity: ${quantity},
          price: ${price}
      }) { id, item, quantity, price }
      `;

      const res = await client.query(query);
      client.close();

      if (res.data === null) {
        return new Response("id not found", {status: 404});
      } else {
        return new Response(
          `Updated item with ID ${id} in the inventory: ${JSON.stringify(res.data)}`, 
          { status: res.httpStatus }
        );    
      }
    } catch(err) {
      return new Response(
        err.queryInfo.summary,
        { status: err.httpStatus }
      );
    }   
  }

  if (method == "DELETE" && pathname.match(`\/inventory\/[^\/]+(\/)?$`)) {
    try {
      const id = decodeURI(pathname.split('/')[2]);

      const client = new Client({ secret }, new FastlyFetchClient(url, backend));

      const query = fql`
      let toDelete = Inventory.byId(${id})
      toDelete?.delete()`;

      const res = await client.query(query);
      client.close();

      if (res.data === null) {
        return new Response("id not found", {status: 404});
      } else {
        return new Response(
          `You have deleted the item with ID: ${id} from the inventory`, 
          { status: res.httpStatus }
        );    
      }
    } catch(err) {
      return new Response(
        err.queryInfo.summary,
        { status: err.httpStatus }
      );
    }   
  }

  return new Response("The page you requested could not be found", {
    status: 404
  });  
}
