#!/usr/bin/env node
/* eslint-disable */

import fetch from 'node-fetch'
import express from 'express'
import bodyParser from 'body-parser'
import ngrok from 'ngrok'

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  Authorization:
    `Basic ${process.env.AUTH_TOKEN}`,
}
let ngrokUrl

function createSessionRequestPayload(callbackBaseUrl, ngrokUrl) {
  return {
    type: 'validate',
    merchantReference: '1234ABC',
    currency: 'GBP',
    language: 'en',
    methods: [
      'card',
      'applepay',
      'googlepay'
    ],
    callbackUrls: {
      approved: `${callbackBaseUrl}/approved`,
      declined: `${callbackBaseUrl}/declined`,
      cancelled: `${callbackBaseUrl}/cancelled`,
    },
    notificationUrl: `${ngrokUrl}/notify`,
    storeCard: true,
    storedCardIndicator: 'recurring',
    customer: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@hosting.com',
      phoneNumber: '+6421384236',
      account: '9999999999999999',
      shipping: {
        name: 'JOHN TT DOE',
        address1: '15 elsewhere lane',
        address2: '',
        address3: '',
        city: 'deliverytown',
        countryCode: 'NZ',
        postalCode: '90210',
        phoneNumber: '+43543435',
        state: '',
      },
      billing: {
        name: 'JOHN TT DOE',
        address1: '15 elsewhere lane',
        address2: '',
        address3: '',
        city: 'deliverytown',
        countryCode: 'NZ',
        postalCode: '90210',
        phoneNumber: '+43543435',
        state: '',
      },
    },
    metaData: ['ABC123'],
  }
}

function startServer() {
  const app = express()
  let server

  app.use(bodyParser.json())

  app.get('/windcave', async (req, res) => {
    // create session
    const body = JSON.stringify(createSessionRequestPayload(`http://localhost:${server.address().port}`, ngrokUrl))

    const response = await fetch('https://uat.windcave.com/api/v1/sessions', { method: 'post', body, headers })

    const createSessionResponse = await response.json()
    console.log(createSessionResponse)

    // load card form
    const submitCardUrl = createSessionResponse.links.find(({ rel, method }) => {
      return rel === 'hpp' && method === 'REDIRECT'
    }).href
    res.redirect(submitCardUrl)
  })

  app.get('/approved', (req, res) => {
    console.log('/approved', req.query)
    res.send(`
    <p class="redirect-callback">Approved form submit:</p>
    <p>${JSON.stringify(req.query, null, 2)}</p>
  `)
  })

  app.get('/declined', (req, res) => {
    console.log('/declined', req.query)
    res.send(`
    <p class="redirect-callback">Declined form submit:</p>
    <p>${JSON.stringify(req.query, null, 2)}</p>
  `)
  })

  app.get('/cancelled', (req, res) => {
    console.log('/cancelled', req.query)
    res.send(`
    <p class="redirect-callback">Cancelled form submit:</p>
    <p>${JSON.stringify(req.query, null, 2)}</p>
  `)
  })

  app.post('/notify', (req, res) => {
    console.log('Server notify', { ...req.body })
    res.sendStatus(200)
  })

  return new Promise((resolve) => {
    server = app.listen(0, () => {
      console.log(`Listening on http://localhost:${server.address().port}/windcave`)
      resolve(server)
    })
  })
}

const server = await startServer()
ngrokUrl = await ngrok.connect(server.address().port)
console.log(`Ngrok is up: ${ngrokUrl}`)
