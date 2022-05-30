## Explorer-Sync

Nestjs monorepo microservices that access the Lum Network Client and fetches recent blocks. It is intended to be a lightweight version of the explorer api.

## Architecture

![Architecture Diagram](https://github.com/Ricardo-Remy/explorer-sync/blob/main/images/architecture.png)

## Acceptance Criterias

- [x] Fetch last X blocks
- [x] Show a given block by its height
- [x] Fetch transactions for a given block
- [x] Show a given transaction by its hash

NB: For the purpose of this exercice, we only return the 100 last fetched blocks.

## Description

The monorepo provides 3 services:

- One block-sync services to sync blocks from lumClient
- One explorer service to insert and expose v1/explorers/blocks api
- One NoSQL database to persist the last fetched blocks

## Features

1. block-sync service (Dockerized):

- Scheduler that fetches the last 20 blocks every 30 seconds
- Processor functionality for the Rabbit-MQ queue
- Caching (ttl 60 seconds) functionality to filter out duplicates in order to emit only sequential blocks to explorer service

2. explorer service (Dockerized)

- Consumer functionality for the Rabbit-MQ queue
- Verifies if the DB does not contain more than 100 documents before inserting a new one (100 serves as a demo for the purpose of this exercise)
- Exposes api endpoint for clients to expose following informations:

```bash
{
  "_id": string,
  "blockHeight": number,
  "blockTx": number,
  "txHashes": array of strings,
  "timestamp": utc timestamp
}
```

NB: By operating requests on lumClient no blockTx and txHashes could be found so far, resulting in 0 and empty array of strings.

- Swagger doc available on port 3001/api
- Versoning has been implemented and defaults to v1
- Caching has been implemented and defaults to a ttl of 60 seconds
- Rate limiting has been implemented to protect against ddos
- Security best practices such as helmet or cors are available on the main root level
- Filters, interceptors and guards have been implemented
- Availability on get /v1/explorers/blocks?limit=xx:
- Authorization key below:

```bash
Authorization: cDQnu1vC1Ad29ZUtOhrj
```

3. NoSQL database (Dockerized common library service)

- MongoDB as NoSQL
- Mongoose as ODM

## Installation

```bash
Developers node version
v12.13.0
```

```bash
$ git clone https://github.com/Ricardo-Remy/explorer-sync.git
```

```bash
$ npm install
```

## Running the app

Make sure you have docker installed.

```bash
# development
$ docker-compose up --build -V
```

Wait a couple of minutes for the services to build and to start receiving the first events (you will see them logged in your terminal).

In a separate terminal window you can run the tests.

```
# unit tests
$ npm run test
```

## Tech stack choices

For the purpose of this exercice, 4 main technical decisions have been taken:

- Use Nestjs as a progressive Nodejs framework. The 3 reasons are:

  - Strongly typed
  - Opinionated architecture which facilitates scalability
  - Active codebase development and maintenance

- Use microservices with monorepo approaches to enforce loose coupling between services
- Rabbit-MQ as a message broker. The 3 reasons are:

  - Message durability
  - Message acknowledgment
  - Can be configured to use SSL

- Use a NoSQL database. The 3 reasons are:
  - The access pattern is defined
  - We don't need to perform flexible or relational queries in this project context
  - Low latency and high speed availability to retrieve documents

## What this app does not contain

- Github actions
- e2e tests and other extensive test cases

NB: Happy to discuss during the code feedback session.

## License

Nest is [MIT licensed](LICENSE).

# explorer-sync
