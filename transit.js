var request = require('request');
var _ = require('lodash');
var xml = require('./xml');

function Transit(API_KEY) {
  this.API_KEY = API_KEY;
}

var BASE_URL = 'http://services.my511.org/Transit2.0/';

Transit.prototype._req = function (method, params) {
  var self = this;
  return new Promise(function (resolve, reject) {
    request(
      {
        url: BASE_URL + method + '.aspx',
        qs: _.assign({}, {token: self.API_KEY}, params)
      },
      function (error, response, body) {
        if (error) {
          reject(error);
          return;
        }
        xml.parseString(body).then(resolve).catch(reject);
      }
    );
  });
};

Transit.prototype.getAgencies = function () {
  return this._req('GetAgencies').then(function (o) {
    return o.find('Agency').map(function (a) {
      return a.attrs.Name;
    });
  });
};

Transit.prototype.getRoutes = function (agency) {
  return this._req('GetRoutesForAgency', {agencyName: agency})
    .then(function (o) {
      return o.find('RouteDirection').map(function (r) {
        var out = {};
        out.code = r.attrs.Code;
        out.name = r.attrs.Name;
        out.mode = r.parents('Agency')[0].attrs.Mode;
        out.agency = r.parents('Agency')[0].attrs.Name;
        out.service = r.parents('Route')[0].attrs.Code;
        return out;
      });
    });
};

Transit.prototype.getStops = function (agency, route, direction) {
  var idf = agency + '~' + route + '~' + direction;
  console.log(idf);
  return this._req('GetStopsForRoute', {routeIDF: idf})
    .then(function (o) {
      return o.find('Stop').map(function (r) {
        var out = {};
        out.code = r.attrs.StopCode;
        out.name = r.attrs.name;
        out.agency = r.parents('Agency')[0].attrs.Name;
        out.service = r.parents('Route')[0].attrs.Code;
        return out;
      });
    });
};

Transit.prototype.getTimes = function (stop) {
  return this._req('GetNextDeparturesByStopCode', {stopcode: stop})
    .then(function (o) {
      return o.find('DepartureTime').map(function (r) {
        var out = {};
        out.time = parseInt(r.value, 10);
        out.stop = r.parents('Stop')[0].attrs.name;
        out.code = stop;
        out.direction = r.parents('RouteDirection')[0].attrs.Name;
        out.agency = r.parents('Agency')[0].attrs.Name;
        out.service = r.parents('Route')[0].attrs.Code;
        return out;
      });
    });
};

module.exports = Transit;
