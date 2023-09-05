# Inventory Management REST API using Fastly Compute@Edge and Fauna

This project is a RESTful API built using Fastly Compute@Edge and Fauna. It manages a simple inventory with basic CRUD (Create, Read, Update, Delete) operations. This project was generated from the [fastly-compute-at-edge-starter-kit](https://github.com/fauna-labs/fastly-compute-at-edge-starter-kit).

## Prerequisites
- A Fauna account
- Fastly account
- Node 18 installed

## Getting Started
Follow these steps to get the Inventory Management REST API up and running:

1. Clone this repository
2. Install dependencies: `npm install`
3. In your `fastly.toml` file in the root directory add the following environment variables:
		- `FAUNA_ACCESS_KEY`: Your Fauna secret key
4. Run the project locally: `fastly compute serve`


## Test Your API
You can use tools like Postman or CURL to test the API:

### Create an Item

```
curl -X POST http://127.0.0.1:7676/inventory -H "Content-Type: application/json" -d '{"item": "Apple", "quantity": 10, "price": 2}'
```

### Get All Items

```
curl -X GET "http://127.0.0.1:7676/inventory"
```

### Get an Item

```
curl -X GET "http://127.0.0.1:7676/inventory/<some-id>"
```

### Update an Item

```
curl -X PUT "http://127.0.0.1:7676/inventory/<ID>" -H "Content-Type: application/json" -d '{"item": "Updated Apple", "quantity": 20, "price": 3}'
```

### Delete an Item

```
curl -X DELETE "http://127.0.0.1:7676/inventory/<ID>"
```

## Deploying your API
This project was created from the [fastly-compute-at-edge-starter-kit](https://github.com/fauna-labs/fastly-compute-at-edge-starter-kit). To deploy, simply follow the [instructions](https://github.com/fauna-labs/fastly-compute-at-edge-starter-kit/tree/main#deploy-using-fastly-cli) found in the README.