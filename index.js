/* jshint esnext: true */
var parseString = avow(require('xml2js').parseString);
var request = avow(require('request'), 1);
var _ = require('lodash');
var handlebars = require('handlebars');
var fs = require('fs');
var template = handlebars.compile(fs.readFileSync(__dirname + '/template.hb').toString());
var templateAjax = handlebars.compile(fs.readFileSync(__dirname + '/template-ajax.hb').toString());
var express = require('express');
var http = require('http');
var Transit = require('./transit');

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

var TRAFFIC_TOKEN = process.env.TRAFFIC_API_TOKEN;
var TRANSIT_TOKEN = process.env.TRANSIT_API_TOKEN;

if (!TRAFFIC_TOKEN || !TRANSIT_TOKEN) {
  console.error('No API token found! Check environment variable `API_TOKEN`.');
}

var five = new Transit(process.env.TRANSIT_API_TOKEN);

function paths(o, d) {
  console.error('connecting');
  return request(
    'http://services.my511.org/traffic/getpathlist.aspx?token=' + TRAFFIC_TOKEN + '&o=' + o + '&d=' + d
  )
  .then(parseString)
  .then(_.partialRight(_.result, 'paths'))
  .then(_.partialRight(_.result, 'path'));
}

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
      console.log(p.incidents);
      o.warning = p.incidents[0].incident && (p.incidents[0].incident.length > 0);
      o.travelTime = p.currentTravelTime[0];
      o.avgTravelTime = p.typicalTravelTime[0];
      return o;
    });
    return paths;
  };
}

function top(results, prop) {
  return function (paths) {
    paths.sort(function (a, b) {
      return a[prop] > b[prop] ? 1 : -1;
    });
    return paths.slice(0, results);
  };
}

function filter(road) {
  return function (paths) {
    paths = paths.filter(function (p) {
      var has = false;
      p.segments[0].segment.forEach(function (s) {
        if (s.road[0].indexOf(road) > -1) {
          has = true;
        }
      });
      return has;
    });
    return paths;
  };
}

function filterout(road) {
  return function (paths) {
    paths = paths.filter(function (p) {
      var has = true;
      p.segments[0].segment.forEach(function (s) {
        if (s.road[0].indexOf(road) > -1) {
          has = false;
        }
      });
      return has;
    });
    return paths;
  };
}

var doc;
var part;

function update() {
  Promise.all([
    updateTraffic(),
    updateTransit()
  ]).then(function (results) {
    var paths = _.flatten(results[0]);
    var trains = results[1];
    trains.sort(function (a, b) {
      return (a.time > b.time) ? 1 : -1;
    });
    trains.forEach(function (t) {
      if (t.time === 1) {
        t.plural = false;
      } else {
        t.plural = true;
      }
    });
    doc = template({paths: paths, trains: trains});
    part = templateAjax({paths: paths, trains: trains});
    setTimeout(update, 30 * 1000);
  }).catch(function (e) {
    console.error(e);
    console.dir(e);
    setTimeout(update, 30 * 1000);
  });
}

function updateTransit() {
  return Promise.all([
    five.getTimes(70211).then(top(2, 'time')),
    five.getTimes(70212).then(top(2, 'time'))
  ]).then(function (o) {
    var arr = _.flatten(o);
    console.log(arr.length + ' departures found');
    return arr.map(function (t) {
      t.service = t.service.toLowerCase();
      if (t.service === 'baby bullet') {
        t.service = 'Express';
      }
      t.direction = t.direction.split(/\s+/)[0].toLowerCase();
      return t;
    });
  });
}

function updateTraffic() {
  return Promise.all([
    paths(35, 1177)
      .then(filter('US-101'))
      .then(filterout('I-280'))
      .then(top(1, 'currentTravelTime'))
      .then(condense('Mozilla SF')),
    paths(35, 1177)
      .then(filter('I-280'))
      .then(top(1, 'currentTravelTime'))
      .then(condense('Mozilla SF')),
    paths(35, 314)
      .then(filter('CA-85'))
      .then(top(1, 'currentTravelTime'))
      .then(condense('SFO Airport')),
    paths(35, 79)
      .then(top(1, 'currentTravelTime'))
      .then(filter('US-101'))
      .then(condense('SJC Airport')),
    paths(35, 637)
      .then(top(1, 'currentTravelTime'))
      .then(condense('Los Gatos')),
    paths(35, 800)
      .then(top(1, 'currentTravelTime'))
      .then(condense('Hayward'))
  ]);
}
update();

var app = express();
app.set('port', (process.env.PORT || 8000));
app.use(express.static(__dirname + '/static'));
var server = http.createServer(app);

app.get('/', function(req, res) {
  res.end(doc);
});

app.get('/update', function(req, res) {
  res.type('html');
  res.end(part);
});

server.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
