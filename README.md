## Install

Requires NodeJS (version 15 or up)

Install dependencies:

    npm install

## Run

The following command will start a server that is visible on the internet so that windcave can send notification requests:

    NGROK_AUTH_TOKEN=YYY AUTH_TOKEN=XXX ./test.js

Where `AUTH_TOKEN` is windcave auth token and `NGROK_AUTH_TOKEN` is your ngrok auth token (sign up for free at https://ngrok.com to get one).

It will also print a URL for the frontend where you can simulate user interations.
