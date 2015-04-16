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
