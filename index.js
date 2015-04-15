/* jshint esnext: true */
var parseString = avow(require('xml2js').parseString);
var request = avow(require('request'), 1);
var _ = require('lodash');
var handlebars = require('handlebars');
var fs = require('fs');
var template = handlebars.compile(fs.readFileSync(__dirname + '/template.hb').toString());
var express = require('express');
var http = require('http');

function avow(fn, pick) {
  pick = pick || 0;
  return function () {
    var args = _.toArray(arguments);
    return new Promise(function (resolve, reject) {
      args.push(function (err) {
        var results = _.toArray(arguments).slice(1);
        if (err) {
          reject(err);
        } else {
          resolve(results[pick]);
        }
      });
      fn.apply(null, args);
    });
  };
}

var TOKEN = process.env.API_TOKEN;

if (!TOKEN) {
  console.error('No API token found! Check environment variable `API_TOKEN`.');
}

function paths(o, d, cb) {
  console.error('connecting');
  return request(
    'http://services.my511.org/traffic/getpathlist.aspx?token=' + TOKEN + '&o=' + o + '&d=' + d
  )
  .then(parseString)
  .then(_.partialRight(_.result, 'paths'))
  .then(_.partialRight(_.result, 'path'));
}


//
// request('http://services.my511.org/traffic/getoriginlist.aspx?token=14e73b26-e7d9-4064-9c60-2e0af41de20b')
//   .then(parseString)
//   .then(function (result) {
//     result.origins.origin.forEach(function(o) {
//       console.error('[' + o.node + '] ' + o.city + ' - ' + o.mainRoad + ' AT ' + o.crossRoad);
//     });
//   });

/*
, function (err, paths) {
console.dir(paths);
console.dir(paths[0].segments[0].segment);
}
*/

var roadURLs = {
  'CA': 'cahwy.svg',
  'US': 'ushwy.svg',
  'I': 'interstate.svg'
};

function condense(destination) {
  return function (paths) {
    console.error('processing %d paths', paths.length);
    paths = paths.map(function (p, i) {
      var o = {
        destination: destination
      };
      if (i === 0) {
        o.heading = true;
      }
      // console.dir(p.segments[0].segment);
      o.roads = p.segments[0].segment
      .map(function (s) {
        s =  _.result(s, 'road')[0];
        var r = s.match(/^([A-Z]+)-([0-9]+)\s\w$/);
        if (!r) {
          return null;
        }
        var url = roadURLs[r[1]];
        if (url) {
          return {
            full: s,
            type: r[1],
            num: r[2],
            url: url
          };
        }
      }).filter(function (s) {
        return !!s;
      });
      o.warning = p.incidents[0].incident && (p.incidents[0].incident.length > 0);
      o.travelTime = p.currentTravelTime[0];
      o.avgTravelTime = p.typicalTravelTime[0];
      return o;
    });
    return paths;
  };
}

var doc;

function update() {
  Promise.all([
    paths(35,42).then(condense('San Francisco')),
    paths(35, 460).then(condense('San Jose')),
    paths(35, 637).then(condense('Los Gatos')),
    paths(35, 1285).then(condense('Fremont'))
    ]).then(function (paths) {
      paths = _.flatten(paths);
      console.error('writing');
      doc = template({paths: paths});
    }).catch(console.error.bind(console));
}
setInterval(update, 5 * 60 * 1000);
update();


var app = express();
app.set('port', (process.env.PORT || 8000));
app.use(express.static(__dirname + '/static'));
var server = http.createServer(app);

app.get('/', function(req, res) {
  res.end(doc);
});

server.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
