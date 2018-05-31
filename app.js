// JavaScript File
'use strict'
var APIKey = "";
// Remember to remove console.dir for optimization.
var callbackFunction = function(data, type, url) {
  console.log(data);
  console.error(type);
  var readableData = JSON.parse(data);
  if (type === 'search') {
    console.dir(readableData);
    Display_Results('id_display', readableData, url);
  } else if (type === 'channel') {
    console.dir(readableData);
    Display_Channel_Info('id_display', readableData, url);
  } else if (type === 'searchchannel') {
    console.dir(readableData);
    Display_Channel_Info('id_display', readableData, url);
  } else if (type === 'getplaylistbychannel') {
    console.dir(readableData);
    Display_Channel_Info('id_display_channellist', readableData, url);
  } else if (type === 'playlist') {
    console.dir(readableData);
    Display_Playlist('id_display_playlist', readableData, url);
  }
  // else
  // {
  //document.getElementById('id_results').innerHTML = "<h2>Search Found Nothing!</h2>";
  //}
}

var callbackFunctionOnError = function(error) {
  console.error(error.message);
}

function Api_Call(url, TYPE) {
  var xmlhttp = new XMLHttpRequest();

  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      callbackFunction(this.responseText, TYPE, url);
    }
    if (this.readyState == 4 && this.status >= 400) {
      var code = this.status;
      this.abort(); // this line might not be needed.
      //Status Code Error
      callbackFunctionOnError(new Error("There was an error getting the data for you. ( status code: " + code + ")"));
    }
  };
  xmlhttp.open("GET", encodeURI(url), true);
  xmlhttp.send();
}

// Just in case I need to set it to Synchronous
//https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Synchronous_and_Asynchronous_Requests
function On_Submit(element_id) {
  var query = document.getElementById(element_id).value.trim();
  var str = "https://www.googleapis.com/youtube/v3/search?part=snippet&key="+ APIKey.trim() +"&q=#SEARCHQUERY";
  var url = str.replace('#SEARCHQUERY', query);
  console.log(url);
 
 Check_API_For_Key();
  
 Api_Call(url, 'search');
}

function Check_API_For_Key() {
  if(APIKey == ""){
  	APIKey = prompt("Please enter an API key", "ex: BIzaSyBqZZXcigk3k4JuR6h1m5B0tBzY6B-AVBM");   
  }
}

function Get_API_For_Key() {
  if(APIKey == ""){
  	APIKey = prompt("Please enter an API key", "ex: BIzaSyBqZZXcigk3k4JuR6h1m5B0tBzY6B-AVBM");   
  }
  else
  {
    APIKey = prompt("Please re-enter an API key:", APIKey);   
  }
}

function on_enter_pressed(event) {
  event.preventDefault();
  if (event.keyCode === 13) {
    On_Submit(event.target.id);
  }
}

function getchannels(channel_id) {
  var url = "https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&key="+ APIKey.trim() +"&id=#ID";
  url = url.replace('#ID', channel_id);
  Api_Call(url, 'channel');
}

function searchchannel(channel_id) {
  var url = "https://www.googleapis.com/youtube/v3/channelSections?part=snippet,contentDetails&key="+ APIKey.trim() +"&channelId=#ID";
  url = url.replace('#ID', channel_id);
  Api_Call(url, 'searchchannel');
}

function getplaylistBychannel(channel_id) {
  var url = "https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&key="+ APIKey.trim() +"&channelId=#ID";
  url = url.replace('#ID', channel_id);
  Api_Call(url, 'getplaylistbychannel');
}

function getplaylist(playlist_id) {
  var url = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails,status&key="+ APIKey.trim() +"&playlistId=#ID";
  url = url.replace('#ID', playlist_id);
  Api_Call(url, 'playlist');
}

function getPage(url, tokenType) {
  console.error(url);
  //var url = tag;//"https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&key="+ APIKey +"&id=#ID";
  //url = url.replace('#ID', channel_id);
  Api_Call(url, tokenType);
}

// The results from a youtube search.
function Display_Results(element_ids, readableData, tag) {
  console.log("I got the data?");
  if (readableData.items.length != 0) {
    document.getElementById(element_ids).innerHTML = create_cards(readableData.items, tag, [readableData.prevPageToken, readableData.nextPageToken, "search"]);
  } else {
    document.getElementById(element_ids).innerHTML = "<h1>No Data Found</h1>"
  }
}

// These card are created as a result of a search. Check Display Result fuction for
// calling function.
function create_card(title, thumbnail, video_id, channel_id) {
  var card = "<div class=\"polaroid\"><a href=\"https://www.youtube.com/embed/#ID?controls=1\" target=\"pp\" ><span class=\"playerWraper\"><img src=\"#URL\" alt=\"#TITLE\" height=\"#HEIGHTpx\" width=\"#WIDTHpx\" onclick=\"location.href='#top';\" /></span></a><div class=\"container\"><a href=\"#id_display_playlist\" onclick=\"getplaylistBychannel('#MOREFROM');\" class=\"morefromlink\">View More from channel</a><p>#TITLE</p></div></div>";

  card = card.replace('#URL', thumbnail.url);
  card = card.replace(/#TITLE/g, title);
  card = card.replace('#HEIGHT', thumbnail.height);
  card = card.replace('#WIDTH', thumbnail.width);
  card = card.replace(/#ID/g, video_id);
  card = card.replace('#MOREFROM', channel_id);
  return card;
}

function create_cards(data, tag, tokens) {
  var cards = createPageTag(data, 'Previous', tag, tokens[0], tokens[2]);

  for (var i = 0; i < data.length; i++) {
    cards = cards + create_card(data[i].snippet.title, data[i].snippet.thumbnails.default, data[i].id.videoId, data[i].snippet.channelId);
  }
  cards = cards + createPageTag(data, 'Next', tag, tokens[1], tokens[2]);

  return cards;
}

function createPageTag(data, direction, url, token, tokenType) {
  var card = "<div class=\"polaroid\"><button type=\"button\" onclick=\"getPage('#TARGET_URL', '#TYPE');\" class=\"btn btnTag\"><h1>#DIRECTION</h1></button></div>";

  var pageToken;

      if(direction === 'Previous'){
  //         pageToken = tag[0].prevPageToken;
direction  = "<";
      }
      else if(direction === 'Next'){
  //        pageToken = tag[1].nextPageToken;
direction  = ">";
      }

  if (token === undefined) {
    card = "";
  } else {

    var index = url.indexOf("&pageToken=");

    if (index != -1) {
      url = url.substring(0, index);
    }
    pageToken = token;
    url = url + "&pageToken=" + pageToken;

    card = card.replace('#DIRECTION', direction);
    card = card.replace('#TARGET_URL', url);
    card = card.replace('#TYPE', tokenType);
  }

  return card;
}

function checkPageToken(token) {
  return (token === undefined) ? null : token;
}

function Display_Channel_Info(element_ids, readableData, tag) {
  console.log("I got the data?" + readableData);

  var requestPerPage = readableData.pageInfo.resultsPerPage;
  var totalResults = readableData.pageInfo.totalResults;

  if (totalResults != 0) {
    document.getElementById(element_ids).innerHTML = createChannel_cards(readableData.items, tag, [readableData.prevPageToken, readableData.nextPageToken, "getplaylistbychannel"]);
  } else {
    document.getElementById(element_ids).innerHTML = "<h1>No Data Found</h1>"
  }
}

function createChannel_card(title, thumbnail, playlist_count, playlist_id) {
  var card = "<div class=\"polaroid\"><img src=\"#URL\" alt=\"#TITLE\" height=\"#HEIGHTpx\" width=\"#WIDTHpx\" /><div class=\"container\"><a href=\"#id_display_channellist\" onclick=\"getplaylist('#MOREFROM');\" class=\"morefromlink\">View Playlist (#COUNT)</a><p>#TITLE</p></div></div>";
  card = card.replace('#URL', thumbnail.url);
  card = card.replace(/#TITLE/g, title);
  card = card.replace('#HEIGHT', thumbnail.height);
  card = card.replace('#WIDTH', thumbnail.width);
  card = card.replace('#COUNT', playlist_count);
  card = card.replace('#MOREFROM', playlist_id);
  return card;
}

function createChannel_cards(data, tag, tokens) {

  var cards = createPageTag(data, 'Previous', tag, tokens[0], tokens[2]);
  for (var i = 0; i < data.length; i++) {
    cards = cards + createChannel_card(data[i].snippet.title, data[i].snippet.thumbnails.default, data[i].contentDetails.itemCount, data[i].id);
  }
  cards = cards + createPageTag(data, 'Next', tag, tokens[1], tokens[2]);

  return cards;
}

function Display_Playlist(element_ids, readableData, tag) {
  console.log("I got the data?" + readableData);
  if (readableData.items.length != 0) {
    document.getElementById(element_ids).innerHTML = create_cardsFromP(readableData.items, tag, [readableData.prevPageToken, readableData.nextPageToken, "playlist"]);
  } else {
    document.getElementById(element_ids).innerHTML = "<h1>No Data Found</h1>"
  }
}

function create_cardsFromP(data, tag, tokens) {
  var cards = createPageTag(data, 'Previous', tag, tokens[0], tokens[2]);

  for (var i = 0; i < data.length; i++) {
    cards = cards + create_card(data[i].snippet.title, checkThumbNail(data[i].snippet), data[i].contentDetails.videoId, data[i].snippet.channelId);
  }
  cards = cards + createPageTag(data, 'Next', tag, tokens[1], tokens[2]);

  return cards;
}

function checkThumbNail(snippet) {
  var thumbnail;
  try {
    thumbnail = snippet.thumbnails.default;
  } catch (err) {
    thumbnail = "";
  }
  return thumbnail;
}
