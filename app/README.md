# Sprint alpha

This is the working alpha of Sprint, an on demand delivery app for Gaborone. It covers ordering from a merchant, paying with a local rail, watching a courier move across the city in real time, and an ops board that shows how the dispatch engine picks a courier and why.

Three demo logins are seeded and ready to go the moment you open the app.

* Customer: Neo, phone 71111111, pin 1234
* Courier: Kabelo, phone 72222222, pin 1234
* Ops: Amo, phone 73333333, pin 1234

The login screen has one tap quick sign in chips for all three, so you can jump between roles in seconds.

## How to run it

Double click `run.cmd` in this folder. It installs anything missing the first time, builds and starts the api, starts the web app, and opens Sprint in your browser at `http://localhost:5173`. Two terminal windows will open and stay open while Sprint is running. You can close them when you are done, or just close this run window and leave the app running in the background.

If you would rather run things by hand, the api lives in `api` and the web app lives in `web`. Each has its own `npm install`, and the api needs `npm run build` before `npm run start`, while the web app just needs `npm run dev`.

## The stack, and why TypeScript end to end

Sprint is built in TypeScript on the web app, the mobile wrapper, and the server. No Python anywhere in the product. That is a deliberate choice from the blueprint, not an accident.

One language across the whole stack means one team can move between the storefront, the courier app, and the server without switching mental gears. A type that describes an order on the server is the same shape a component on the web app expects, so a whole class of bugs simply cannot happen. It also makes hiring easier here in Gaborone and beyond, since TypeScript and JavaScript developers are far easier to find and are comfortable across the entire codebase, rather than needing separate Python and JavaScript specialists who each only know half the system.

## The path to the app stores

Today Sprint ships as an installable web app. Open it on a phone and add it to the home screen, and it behaves like a native app already, complete with its own icon and offline shell.

When it is time for the app stores, this same TypeScript codebase wraps with Capacitor, which packages a web app as a real native app for the Apple App Store and Google Play without a rewrite. The interface, the logic, and the types all carry over. Only the store packaging changes.

## Security notes

* Every signed in request carries a JWT, checked on the server before anything happens.
* Pins are hashed with bcrypt for this alpha, chosen because it needs no native build tools and keeps setup painless on any machine. Production moves to argon2id, the stronger modern standard from the blueprint.
* Personal data such as phone numbers and delivery addresses is encrypted at rest with AES 256 GCM before it ever touches disk.
* The api sends the standard hardening headers and disables the framework fingerprint header.
* Login attempts are rate limited per address, so a brute force guess loop gets shut down quickly.

## What changes for a real production launch

This alpha keeps its data in a single JSON file so it is easy to run anywhere with nothing to install beyond Node. Production swaps that for Postgres with PostGIS, so courier positions and delivery zones are real geospatial queries rather than approximated math.

The customer storefront moves to Next.js for faster loads and stronger search visibility. Payment goes from the demo rails you see in checkout today to real integrations with Orange Money, MyZaka, Smega, and card processing, so money actually moves.
