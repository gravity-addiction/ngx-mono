import express = require('express');

import * as bodyParser from 'body-parser';
import cors = require('cors');
import { readFileSync } from 'fs';
import { createServer as http_createServer } from 'http';
import { createServer as https_createServer } from 'https';

import { IAPISettings } from './models/i-api-settings';
import logger = require('morgan');
import minimist = require('minimist');
import compression = require('compression');
const debug = require('debug')('api');

export function APIConfig(app: express.Application, settings?: IAPISettings) {
  const args: any = minimist(process.argv);

  let dotenv: any = {};
  if (args.env) { dotenv = require('dotenv').config({ path: args.env }); }

  // mount logger
  if (parseBool(args.logger || dotenv.LOGGER || settings.logger || false)) {
    app.use(logger('dev'));
  }

  // CORS - Whitelisting
  if (parseBool(args.use_cors || dotenv.USE_CORS || settings.use_cors || true)) {
    const whitelist = args.whitelist || dotenv.WHITELIST || settings.whitelist || '*';
    app.use(cors({
      origin: whitelist,
      credentials: true
    }));
  }

  // Add compression
  if (parseBool(args.compression || dotenv.COMPRESSION || settings.compression || true)) {
    // app.use(compression());
  }

  // mount body parsers parser
  // JSON Parser
  const bodyparser_json = args.bodyparser_json || dotenv.BODYPARSER_JSON || settings.bodyparser_json || false;
  if (bodyparser_json) { app.use(bodyParser.json(bodyparser_json)); }

  // URL Encoded Parser
  const bodyparser_urlencoded = args.bodyparser_urlencoded || dotenv.BODYPARSER_URLENCODE || settings.bodyparser_urlencoded || false;
  if (bodyparser_urlencoded) { app.use(bodyParser.urlencoded(bodyparser_urlencoded)); }

  // Text parser
  const bodyparser_text = args.bodyparser_text || dotenv.BODYPARSER_TEXT || settings.bodyparser_text || false;
  if (bodyparser_text) { app.use(bodyParser.text(bodyparser_text)); }

  // configure jade
  if (parseBool(args.jade || dotenv.JADE || settings.jade || false)) {
    const jade_views = args.jade_views || dotenv.JADE_VIEWS || settings.jade_views || './views';
    app.set('views', jade_views);
    app.set('view engine', 'jade');
  }

}

export function API(app: express.Application, settings?: IAPISettings) {
  const args: any = minimist(process.argv);
  let dotenv: any = {};
  if (args.env) { dotenv = require('dotenv').config({ path: args.env }); }

  const http_server = parseBool(args.http_server || dotenv.HTTP_SERVER || settings.http_server || true),
        ssl_server = parseBool(args.ssl_server || dotenv.SSL_SERVER || settings.ssl_server || false)
  ;

  // HTTPS Server
  if (ssl_server) {

    // HTTPS Settings
    const ssl_ip = args.ssl_ip || dotenv.SSL_IP || settings.ssl_ip || '0.0.0.0';
    const ssl_port = normalizePort(args.ssl_port || dotenv.SSL_PORT || settings.ssl_port || 3443);
    const ssl_cert = {
      key: readFileSync(args.ssl_key || dotenv.SSL_KEY || settings.ssl_key),
      cert: readFileSync(args.ssl_cert || dotenv.SSL_CERT || settings.ssl_cert)
    };
    app.set('sslport', ssl_port);
    app.set('sslip', ssl_ip);

    // Start SSL Server
    const sslserver = https_createServer(ssl_cert, app);
    sslserver.listen(ssl_port, ssl_ip, (err) => {
      debug('Created Listener on https://' + ssl_ip + ':' + ssl_port);
    });

    sslserver.on('error', (err) => onError(err, ssl_port));
    sslserver.on('listening', () => onListening(sslserver.address()));
  }

  if (http_server) {
    // Start HTTP if SSL isn't active or on non-conflicting ports
    const ip = args.ip || process.env.IP || dotenv.IP || settings.ip || '0.0.0.0';
    const port = normalizePort(args.port || process.env.PORT || dotenv.PORT || settings.port || 3080);
    app.set('port', port);
    app.set('ip', ip);

    const server = http_createServer(app);
    server.listen(port, ip, (err) => {
      debug('Created Listener on http://' + ip + ':' + port);
    });

    server.on('connect', () => onConnection());
    server.on('connection', () => onConnection());
    server.on('error', (err) => onError(err, port));
    server.on('listening', () => onListening(server.address()));

  }

  /* process.on('uncaughtException', function (exception) {
    debug(exception);
  });
  */

  // Redirect CTRL-C Stops to Exit Normally
  process.on('SIGINT', () => {
    process.exit(0);
  });

  // Clean up from running processes
  process.on('exit', () => {
    debug('\nShutting Down..\n');
  });
}

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Parse boolean values into proper true/false
 */
function parseBool(str) {
  if (str == null) { return false; }
  if (typeof str === 'boolean') { return (str === true); }
  if (typeof str === 'string' && str === '') {
    return false;
  } else if (typeof str === 'string') {
    str = str.replace(/^\s+|\s+$/g, '');
    if (str.toLowerCase() === 'true' || str.toLowerCase() === 'yes') { return true; }
    str = str.replace(/,/g, '.');
    str = str.replace(/^\s*\-\s*/g, '-');
  }
  if (!isNaN(str)) { return (parseFloat(str) !== 0); }
  return false;
}


/**
 * Event listener for HTTP server 'error' event.
 */
function onError(error, port) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      debug(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      debug(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server 'listening' event.
 */
function onListening(addr) {
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}


/**
 * Event listen for HTTP Connections
 */
function onConnection() { }
