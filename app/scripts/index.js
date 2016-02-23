var Handlebars = require('handlebars');
var $ = require('jquery');
//api key stored in file not tracked by source control
var key = require('./key');
var url = 'https://openapi.etsy.com/v2/';
// console.log(apiKey);
// var defaultURL = 'https://openapi.etsy.com/v2/listings/active.js?keywords='+terms+'&limit=12&includes=Images:1&api_key='+key;
var categoryMethod = 'taxonomy/categories.js';
var listings = 'https://openapi.etsy.com/v2/listings/active.js?api_key='+key;
var toplevelcats = 'https://openapi.etsy.com/v2/taxonomy/categories.js?api_key='+key;
var searchObj = { keywords: 'whiskey',
                  limit: '12'};
var searchMethod = 'listings/active.js';
function etsyCall( methodUrl, argsObj){
  var etsyURL = url + methodUrl + '?api_key=' + key;
  console.log(argsObj);
  if(argsObj !== undefined){
    $.each(argsObj, function(prop, value){
      console.log(prop, value);
      etsyURL += '&' + prop + '=' + value;
    });
  }
  console.log(etsyURL);
  $.ajax({
    url: etsyURL,
    dataType: 'jsonp',
    // method: 'findAllTopCategory',
    success: function(data){
      if(data.ok){
        handleCategory(data, methodUrl);
    }else{
      console.log(data.error);
      console.log(data);
    }
    }
  });
  return false;
}

// etsyCall(searchMethod, searchObj);
var topCats = etsyCall( categoryMethod);
var searchedObjs = etsyCall( searchMethod, searchObj );
function handleCategory(data, method){
  console.log(data);
  console.log(method);
  switch (method) {
    case categoryMethod:
      console.log('category method was called');
      var source = $('#category-template').html();
      var template = Handlebars.compile(source);
      var html = template({'results': data.results});
      $('.categories > .inside').html(html);
      break;
    case searchMethod:
      console.log('search method was called');
      break;
  }
}


Handlebars.registerHelper('maincats', function(items) {
  var out = "<ul>";

  for(var i=0, l=items.length; i<l; i++) {
    console.log(this);
    if(i<8){
      out = out + '<a href="http://www.etsy.com/c/' + this.results[i].category_name + '" alt="' + this.results[i].long_name + '"><li class="cat-item">' + this.results[i].short_name + '</li></a>';
    }
  }

  return new Handlebars.SafeString(out + "</ul>");
});
