var Handlebars = require('handlebars');
var $ = require('jquery');
//api key stored in file not tracked by source control
var key = require('./key');
var url = 'https://openapi.etsy.com/v2/';
// console.log(apiKey);
// var defaultURL = 'https://openapi.etsy.com/v2/listings/active.js?keywords='+terms+'&limit=12&includes=Images:1&api_key='+key;

var listings = 'https://openapi.etsy.com/v2/listings/active.js?api_key='+key;
var toplevelcats = 'https://openapi.etsy.com/v2/taxonomy/categories.js?api_key='+key;
var searchObj = { keywords: 'whiskey',
                  limit: '12'};
var searchMethod = 'listings/active.js';
function etsyCall(methodUrl, argsObj){
  var etsyURL = url + methodUrl + '?api_key=' + key;
  $.each(argsObj, function(prop, value){
    console.log(prop, value);
    etsyURL += '&' + prop + '=' + value;
  });
  $.ajax({
    url: etsyURL,
    dataType: 'jsonp',
    // method: 'findAllTopCategory',
    success: function(data){
      if(data.ok){
      console.log(data);

      $.each(data.results, function(key, obj){
        console.log(obj.price);
      });
    }else{
      console.log(data.error);
      console.log(data);
    }
    }
  });
  return false;
}

etsyCall(searchMethod, searchObj);
