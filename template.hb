<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <link href='//fonts.googleapis.com/css?family=Fira+Mono|Raleway:500' rel='stylesheet' type='text/css'>
    <style>
      table {
        width: 100%;
      }
      body {
        background: #222;
        color: #fff;
        font-size: 4vmin;
        font-family: 'Raleway', sans-serif;
      }
      .route i {
        display: inline-block;
        vertical-align: middle;
        font-size: .5em;
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
        transform: -webkit-translate(-50%, -50%);
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
        padding: 0 1em;
      }
      li {
        text-align: center;
        background: #222;
        margin-top: .2em;
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
      .dest, .time {
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
      }
      .dest {
        width: calc(16ch + 64px);
      }
      .route {
        width: 25vw;
        margin: 0 4vw;
      }
      .time {
        width: calc(10ch + 40px);
        text-align: right;
        position: relative;
      }
      .warning {
        height: .8em;
        position: absolute;
        top: .24em;
        right: -1.2em;
      }
    </style>
  </head>
  <body>
      <header>
        <h1>Mountain View Transit</h1>
      </header>
      <ul>
        {{#each paths}}
        <li>
          <div class="dest">
            {{destination}}
          </div>
          <div class="route">
            <i>via</i>
            {{#each roads}}
            <div class="road road-{{type}}" title="{{full}}">
              <img src="{{url}}" alt="{{full}}">
              <span>{{num}}</span>
            </div>
            {{/each}}
          </div>
          <div class="time">
            {{#if warning}}
            <img src="warning.svg" class="warning">
            {{/if}}
            {{travelTime}} mins
          </div>
        </li>
        {{/each}}
    </ul>
  </body>
</html>
