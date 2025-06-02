module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          "http": false,
          "https": false,
          "url": false,
          "stream": false,
          "crypto": false,
          "zlib": false,
          "fs": false,
          "path": false,
          "os": false,
          "net": false,
          "tls": false,
          "child_process": false,
          "dns": false,
          "dgram": false,
          "buffer": false,
          "util": false,
          "assert": false,
          "constants": false,
          "querystring": false,
          "string_decoder": false,
          "punycode": false,
          "process": false,
          "vm": false,
          "events": false,
          "domain": false,
          "timers": false
        }
      }
    }
  }
}; 