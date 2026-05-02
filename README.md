# Multiplayer Chess

Full-stack chess web app with a React frontend and an Express + MongoDB backend. Two players join the same game with a shared key and play in turn.

Status: in progress, runs locally only. Some endpoints aren't finished and there's a bit of dev-only code still in `api/index.js` (the database gets wiped on server start). Plan to clean it up and deploy at some point.

## Stack

- **Frontend:** React, Vite (`frontend/chessReact`)
- **Backend:** Node, Express, MongoDB (`api/`)
- Custom move validation and turn handling, no chess engine library.
- Shared game keys via `crypto.randomBytes`.

## Running locally

You'll need MongoDB running locally and a `.env` in `api/` with `PORT` and `uri` (Mongo connection string).

```sh
# backend
cd api
yarn install
yarn start

# frontend (new terminal)
cd frontend/chessReact
yarn install
yarn dev
```

## Notes

This was the project I used to learn how a real client/server app fits together. The move-validation logic in particular taught me a lot about state machines and edge cases.
