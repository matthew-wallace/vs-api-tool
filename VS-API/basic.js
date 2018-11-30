var tools = require('authentication');

/*

getBaseUrl()
function that provides the API base_url to access standard API endpoints


GET URL EXAMPLE
  getBaseUrl(
    distributor = a string that specifies the name of the distributor
  )

USAGE
Always returns a string so that the correct cloud instance is used with the API:
getBaseUrl(distributor);

*/
function getBaseUrl(distributor){
  if(distributor=='Avery Dennison'){
    return 'https://freshmarx-login.averydennison.com/api/v7/';
  }
  else{
    return 'https://staging.verisolutions.co/api/v7/';
  }
}

/*

makeTransaction()
function that makes generic transactions with the cloud. This function can be used to retrieve any object in the cloud.

RETRIEVE AN OBJECT EXAMPLE
 makeTransaction(
  url_ext = Text to Append to Base URL
  msg     = API Message should be left empty using ''
  op      = Use 'GET' since we are retrieiving objects
  base_url= API Access Point -> i.e.: 'https://staging.verisolutions.co/api/v7/'
)

SEND AN OBJECT EXAMPLE
makeTransaction(
  url_ext = Text to Append to Base URL
  msg     = API Message should be sent by creating a JSON object, then turned to a string using JSON.stringify()
  op      = Use 'POST' since we are creating objects
  base_url= API Access Point -> i.e.: 'https://staging.verisolutions.co/api/v7/'
)

USAGE
Always Returns a promise so that asynchronus result may be returned:
makeTransaction().then(function(var_name){HANDLE Returned API Object}).catch(function(var_name){HANDLE Error Message})

*/
function returnAuth(){
  return 'YOUR API KEY HERE';
}
function makeTransaction(url_ext, msg, op, base_url){

  var url = base_url + url_ext;

  console.log('Accessing Link: '+url);

    var data = {};
    if(op=='POST' || op=='PATCH'){
      data = {
      method: op,
      payload: msg,
      headers:{
        'Content-Type': 'application/vnd.api+json',
        'Authorization': returnAuth()
        }
      };
    }
    else{
      data = {
      method: op,
      headers:{
        'Content-Type': 'application/vnd.api+json',
        'Authorization': returnAuth()
        }
      };
    }

    var response = fetch(url, data);
    var code = response.getResponseCode();
    if (code >= 200 && code<=300) {
      if (code == 201){
        console.log('Your object was created successfuly.');
        return JSON.parse(response);
      }
      if(code == 200){
        console.log('Your data has been retrieved.');
        return JSON.parse(response);
      }
      if(code == 204){
        console.log('Your object was deleted succesfully.');
        return 'Your Item was Deleted.';
      }
    }
    else{
        console.log('Looks like there was a problem. Status Code: ' + code);
        return 'Looks like there was a problem. Status Code: ' + code;
      }
  }

/*
findRecords()
function that returns any kind of record using optional search parameters

findRecords(
  record_type = a String containing the API name of the record type that will be returned
  distributor = a String containing the product distributor so that the right API Access Point may be selected.
  attributes = a Javascript Object containing record attribute names paired with search Strings
)

*/
function findRecords(record_type,attributes,distributor) {
  var base_url = getBaseUrl(distributor);
  var url_ext = record_type;

  console.log(JSON.stringify(attributes));

  //break down request parameters
  var filtering = attributes.filters;
  var sorting = attributes.sorting;
  var settings = attributes.settings;

  //append URL parts appropriately
  function addToUrl(url_ext,record_type){
    if(url_ext == record_type){
       url_ext += '?';
    }
    else{
       url_ext += '&';
    }
    return url_ext;
  }

  //apply filters to URL
  if(typeof filtering != 'undefined'){
    var filter_names = Object.keys(filtering);
    for(i=0;i<filter_names.length;i++){
      url_ext = addToUrl(url_ext,record_type) + 'filter['+filter_names[i]+']='+encodeURI(filtering[filter_names[i]]);
      console.log(url_ext);
    }
  }

  //apply sorting to URL
  if(typeof sorting != 'undefined'){
    var sorting_attr = Object.keys(sorting);
    var sort_string;
    for(i=0;i<sorting.length;i++){
      sort_string = sorting_attr[i];
      if(sorting_mode[i] == 'DESC'){
        sort_string = '-' + sort_string;
      }
      url_ext = addToUrl(url_ext,record_type) + 'sort='+encodeURI(sorting[sorting_attr[i]]);
      console.log(url_ext);
    }
  }

  //apply page settings to URL
  if(typeof settings != 'undefined'){
    var setting_names = Object.keys(settings);
    for(i=0;i<settings.length;i++){
      url_ext = addToUrl(url_ext,record_type) + 'page['+setting_names[i]+']='+encodeURI(settings[setting_names[i]]);
      console.log(url_ext);
    }
  }

  var results = makeTransaction(url_ext,'','GET',base_url);
  return results.data;
}

/*
addRecords()
function that adds new records and then returns an array of the records that were created

addRecords(
  record_type = a String containing the API name of the record type that will be returned
  records = an Array of preformatted objects corresponding to the record_type
  distributor = a String containing the product distributor so that the right API Access Point may be selected.
)

*/
function addRecords(record_type,records,distributor,cloud_id){
  var base_url = getBaseUrl(distributor);
  var url_ext = record_type;
  var method = 'POST';
  console.log(typeof cloud_id);
  if(typeof cloud_id != 'undefined' && cloud_id !== null){
    records.data.id = cloud_id.toString();
    method='PATCH';
    url_ext+='/'+cloud_id.toString();

    //requested API change to allow account-id to be passed with unit object on update
    if(records.data.type == 'accounts'){
       delete records.data.attributes['account-id'];
    }
    if(records.data.type == 'coolers'){
       delete records.data.attributes['unit-id'];
    }
  }
  var msg = JSON.stringify(records);

  var results = makeTransaction(url_ext,msg,method,base_url);
  return results.data;
}

/*

getUserByEmail()
function that returns a user object

CREATE A NEW ACCOUNT EXAMPLE
getUserById(
    email = an Integer passed to look up a user
    [distributor] = an String containing the product distributor so that the right API Access Point may be selected, default value is 'VeriSolutions'
  )

*/
function getUserByEmail(email,distributor){
  var attributes = {'filters':{'email':email}};
  var users = findRecords('users',attributes,distributor);
  var user = users[0];
  return user;
}


  //public functions
  module.exports = {
    validateUser: function (email,distributor) {
      console.log('The function has been called!');
      user = getUserByEmail(email,distributor);
      console.log(user);
      if(user.type == 'account-users'){
        if(user.type.attributes['account-admin']){
          return true;
        }
      }
      else{
        return false;
      }
    }
  };
