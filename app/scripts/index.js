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
      console.log(data);
      var searchResult = data.results;
      var catArr = [];
      var tagArr = [];
      $.each(searchResult, function(){
        //trim title value for screen display but save fulllength
        if( !this.hasOwnProperty('error_messages')){
          if(this.title.length > 28){
            this.full_title = this.title;
            this.title = this.title.slice(0, 26) + '...';
          }
          //build an array of objects to use for category areas
          if( this.taxonomy_path !== null ){
            catArr.push({ 'title':this.taxonomy_path[0], 'cat-image':this.MainImage.url_570xN, 'num-items':_.random(5000, 100000) });
          }else{
            catArr.push({ 'title':this.category_path[0], 'cat-image':this.MainImage.url_570xN, 'num-items':_.random(5000, 100000) });
          }
          //build an array of tag objects
          $.each(this.tags, function(){
            tagArr.push(this);
          });
        }
      });
      var counts = _.countBy(tagArr, _.identity);
      tagArr = [];
      $.each(counts, function(index, value){
        tagArr.push({'title':index, 'count':value, 'urlStr': index.replace(' ', '+')});
      });
      tagArr = _.sortBy(tagArr, 'count').reverse();
      tagArr = _.filter(tagArr, function(thing){
        if(thing.count > 1){
          return true;
        }else{
          return false;
        }
      });

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
      //insert categories into sidebar
      var source = $('#sidebar-template').html();
      var template = Handlebars.compile(source);
      var html = template({'categories': context});
      $('#sidebar-cats').html(html);
      //insert main category panels at top of content area
      source = $('#top-cat-template').html();
      template = Handlebars.compile(source);
      html = template({'categories': context.slice(0,5)});
      $('#top-cats').html(html);
      //add listings to the page from api query
      source = $('#result-template').html();
      template = Handlebars.compile(source);
      html = template({results: searchResult});
      $('#results-grid ul').html(html);
      //replace {{seach-term placeholders}}
      $('.top-cats-title').html('Top categories for ' + data.params.keywords);
      var catPath = $('.results-cat-path-replace').html().replace('{{search-term}}',data.params.keywords).replace('{{num-results}}', data.count);
      $('.results-cat-path-replace').html(catPath);
      $('.related-search-term').html(data.params.keywords);
      //do related terms template
      source = $('#related-terms-template').html();
      template = Handlebars.compile(source);
      console.log(tagArr);
      html = template({relatedObj: tagArr});
      $('.related ul').html(html);
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
