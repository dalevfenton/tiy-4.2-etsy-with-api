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
                  limit: '24',
                  includes: 'Images,Shop,MainImage'};
var searchMethod = 'listings/active.js';
function etsyCall( methodUrl, argsObj){
  var etsyURL = url + methodUrl + '?api_key=' + key;
  // console.log(argsObj);
  if(argsObj !== undefined){
    $.each(argsObj, function(prop, value){
      // console.log(prop, value);
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
  // console.log(data);
  // console.log(method);
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
        //trim title value for screen display but save fulllength
        if(this.title.length > 30){
          this.full_title = this.title;
          this.title = this.title.slice(0, 29) + '...';
        }
        catArr.push({ 'title':this.taxonomy_path[0], 'cat-image':this.MainImage.url_570xN, 'num-items':_.random(5000, 100000) });
      });
      // console.log(catArr);
      var catObj = {};
      $.each(catArr, function(){
        if(catObj.hasOwnProperty(this.title)){
          catObj[this.title].counter += 1;
        }else{
          catObj[this.title] = this;
          catObj[this.title].counter = 1;
        }
      });
      var objArr = [];
      $.each(catObj, function(){
        objArr.push(this);
      });
      var sortedArr = _.sortBy(objArr, 'counter').reverse();
      var context = [];
      $.each(sortedArr, function(index){
        console.log(index);
        var tempObj = {'title':this.title, 'count':this.counter, 'cat-image':this['cat-image'], 'num-items':this['num-items']  };
        if(index< 2){
          if(index === 1){
            tempObj['width-class'] = 'half';
          }else{
            tempObj['width-class'] = 'half last';
          }
        }else if(index < 5){
          if(index === 4){
            tempObj['width-class'] = 'third last';
          }else{
            tempObj['width-class'] = 'third';
          }
        }
        context.push(tempObj);
      });
      console.log(context);
      var source = $('#sidebar-template').html();
      var template = Handlebars.compile(source);
      var html = template({'categories': context});
      $('#sidebar-cats').html(html);
      source = $('#top-cat-template').html();
      template = Handlebars.compile(source);
      html = template({'categories': context.slice(0,5)});
      $('#top-cats').html(html);
      source = $('#result-template').html();
      template = Handlebars.compile(source);
      html = template({results: searchResult});
      $('#results-grid ul').html(html);
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
