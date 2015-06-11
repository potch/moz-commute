<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <link href='//fonts.googleapis.com/css?family=Fira+Mono|Raleway:500' rel='stylesheet' type='text/css'>
    <title>Mountain View Transit | Driving Times</title>
    <style>
      * {
        box-sizing: border-box;
      }
      html, body {
        height: 100%;
      }
      body {
        background: #222;
        padding: .5em;
        color: #fff;
        font-size: 4vmin;
        display: flex;
        margin: 0;
        flex-direction: column;
        font-family: 'Raleway', sans-serif;
      }
      i {
        display: inline-block;
        vertical-align: middle;
        font-size: .65em;
        margin-right: 1em;
        letter-spacing: .1em;
        font-style: normal;
        text-transform: uppercase;
      }
      .road {
        position: relative;
        display: inline-block;
        vertical-align: middle;
        width: 6vmin;
        height: 1.2em;
        text-align: center;
      }
      .road img {
        height: 4.5vmin;
      }
      .road span {
        position: absolute;
        top: 50%;
        left: 50%;
        -webkit-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
        content:attr(data-num);
        color: #fff;
        display: block;
        font-size: 2vmin;
        font-family: sans-serif;
        line-height: 1;
      }
      .road-CA span {
        top: 3vmin;
      }
      .road-I span {
        top: 2.6vmin;
      }
      .road-US span {
        top: 2.5vmin;
        color: #000;
      }
      ul {
        list-style-type: none;
        padding: 0 3em;
      }
      li {
        text-align: center;
        background: #222;
        display: flex;
        margin: .1em 0;
      }
      li > div {
        text-align: left;
        display: inline-block;
      }
      h1 {
        font-family: 'Raleway';
        text-transform: uppercase;
        letter-spacing: .2em;
        text-indent: .1em;
        text-align: center;
        font-size: 2em;
        margin: .5em;
        font-weight: 500;
      }
      .disp {
        line-height: 1.4em;
        font-family: 'Fira Mono';
        text-indent: 2px;
        letter-spacing: 4px;
        background: #000;
        background-image:
          linear-gradient(90deg, #222 5%, transparent 5%, transparent 95%, #222 95%),
          linear-gradient(#222 10%, transparent 10%, transparent 50%, rgba(100,100,100,.2) 50%, rgba(100,100,100,.2) 90%, #222 90%);
        background-size: calc(1ch + 4px) 1.5em;
        background-position: left -.1em;
        background-repeat: repeat-x;
        text-transform: capitalize;
      }
      .dest {
        width: calc(20ch + 80px);
      }
      .route {
        width: 12em;
      }
      .flex {
        flex: 1;
      }
      .time {
        width: calc(10ch + 40px);
        text-align: right;
        position: relative;
        text-transform: lowercase;
      }
      .warning {
        height: .8em;
        position: absolute;
        top: .25em;
        left: -1.2em;
      }
      .depart {
        width: 12em;
        text-transform: uppercase;
      }
      .driving + .train {
        margin-top: 2em;
      }
    </style>
  </head>
  <body>
      <header>
        <h1>Mountain View Transit</h1>
      </header>
      <ul class="list">
        {{#each paths}}
        <li class="driving">
          <div class="dest disp">
            {{destination}}
          </div>
          <span class="flex"></span>
          <div class="route">
            <i>via</i>
            {{#each roads}}
            <div class="road road-{{type}}" title="{{full}}">
              <img src="{{url}}" alt="{{full}}">
              <span>{{num}}</span>
            </div>
            {{/each}}
          </div>
          <span class="flex"></span>
          <div class="time disp">
            {{#if warning}}
            <img src="warning.svg" class="warning">
            {{/if}}
            {{travelTime}} mins
          </div>
        </li>
        {{/each}}

        {{#each trains}}
        <li class="train">
          <div class="dest disp">
            {{direction}} {{service}}
          </div>
          <span class="flex"></span>
          <div class="depart">
            <i>departing in</i>
          </div>
          <span class="flex"></span>
          <div class="time disp">
            {{#if plural}}
            {{time}} mins
            {{else}}
            {{time}} min&nbsp;
            {{/if}}
          </div>
        </li>
        {{/each}}
    </ul>
    <script>
      function update() {
        var xhr = new XMLHttpRequest();

        console.log('fetching');
        xhr.onload = function () {
          var html = xhr.responseText;
          console.log('updated');
          document.querySelector('.list').innerHTML = html;
        };
        xhr.open('GET', '/update');
        xhr.send();
      }
      setInterval(update, 10*1000);
    </script>
  </body>
</html>
