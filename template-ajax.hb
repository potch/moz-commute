<h2>Drive Times</h2>
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
    {{time}} mins
  </div>
</li>
{{/each}}

<h2>Caltrain</h2>
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
{{else}}
<li class="error">No transit data found.</li>
{{/each}}
