var Handlebars = require('handlebars');
var $ = require('jquery');
var _ = require('underscore');
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
      var cats = data.results;
      var source = $('#category-template').html();
      var template = Handlebars.compile(source);
      var html = template({'results': cats});
      $('.categories > .inside').html(html);
      break;
    case searchMethod:
      console.log('search method was called');
      var searchResult = data.results;
      var catArr = [];
      $.each(searchResult, function(){
        catArr.push(this.taxonomy_path[0]);
      });
      var catObj = {};
      $.each(catArr, function(){
        if(catObj.hasOwnProperty(this)){
          catObj[this] += 1;
        }else{
          catObj[this] = 1;
        }
      });
      var context = [];
      $.each(catObj, function(prop, value){
        context.push({title:prop, count:value});
      });
      console.log(context);
      var source = $('#sidebar-template').html();
      var template = Handlebars.compile(source);
      var html = template({'categories': context});
      $('#sidebar-cats').html(html);
      break;
  }
}


Handlebars.registerHelper('maincats', function(items) {
  var out = "<ul>";

  for(var i=0, l=items.length; i<l; i++) {
    // console.log(this);
    if(i<8){
      out = out + '<li class="cat-item"><a class="nav-top-link" href="http://www.etsy.com/c/' + this.results[i].category_name + '" alt="' + this.results[i].long_name + '">' + this.results[i].short_name + '</a></li>';
    }
  }

  return new Handlebars.SafeString(out + "</ul>");
});
