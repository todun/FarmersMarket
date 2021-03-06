/**
 * Farmers Market JS - A simple app to plot local farmer's markets.
 *
 * This file contains functions for the search
 *
 * @author: Schuyler Ankele
 */

/**
 * Represents a single farmers market
 * @constructor
 */
function market() {
    var id = -1;
    var name;
    var distance = -1.0; // First Sentinel value
    var address;
    var loc = [];
    var products = '';
    var hours = '';
    var completed; // Bool to notate whether all the data for this location has been pulled

}
/**
 * @constructor
 * @param {int} id - used to trigger marketDetails
 * @param {string} name - name of the market
 * @param {float} distance - results are returned in an array of 10 listed by shortest distance
 * @param {string} address - used for geocoding on the map
 */
function market(id, name, distance) {
    this.id = id;
    this.name = name;
    this.distance = distance;

}

function market(id, name, distance, address, loc, products, hours, completed) {
    this.id = id;
    this.name = name;
    this.distance = distance;
    this.address = address;
    this.loc = loc;
    this.products = products;
    this.hours = hours;
    this.completed = completed;
}

var markets = [];
var responseList = [];
const marketTable = document.getElementById('marketDetails');
mktTblHeader();


$(function () {
    // Click listener for the 'Search by Zip' button
    $("#search-submit").click(function () {
        // Clear all the rows except 1
        $('#marketDetails tr').slice(1).remove();
        // Make the API call with the ZIP
        marketsByZip($("#zip").val());
    });

});

/**
 * @param zipCode = 5 digit US Postal Zip Code
 * This method returns a JSON array of the markets
 */
function marketsByZip(zipCode){
    // jQuery AJAX
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: "https://search.ams.usda.gov/farmersmarkets/v1/data.svc/zipSearch?zip=" + zipCode,
        dataType: "jsonp",
        jsonpCallback: "marketsFilter"

    });
}

/**
 * Market by GPS will return a single JSON object with details about a certain location
 * @param lat
 * @param lng
 *
 */
function marketsByGPS(lat, lng){
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: "https://search.ams.usda.gov/farmersmarkets/v1/data.svc/locSearch?lat=" + lat + "&lng=" + lng,
        dataType: "jsonp",
        jsonpCallback: "marketsFilter"
    });
}

/**
 * @function marketFilter - iterates and parses through the return JSON array from USDA API
 *
 * The data is modeled and returned in a cleaned JS array of objects
 *
 * @param json_array
 */
function marketsFilter(json_array){
    for(var instance in json_array){
        var marketsArray = json_array[instance];
        for(var i = 0; i < marketsArray.length; i++){
            var marketDetail = marketsArray[i];
            market_obj = new market();
            for(key in marketDetail){
                if(key == "marketname"){
                    // Then its really two objects in a String 'Distance Market Name'
                    // We'll need to take the distance and name as separate strings
                    delimPos = marketDetail[key].search(/\./);
                    distInMI = parseFloat(marketDetail[key].substr(0, delimPos + 2));
                    console.log('This is mileage' + distInMI)
                    marketName = marketDetail[key].substr(delimPos + 3);
                    market_obj.name = marketName;
                    market_obj.distance = distInMI;
                }
                else if(key == "id"){
                    var marketID = marketDetail[key];
                    console.log('Heres the id' + marketID);
                    market_obj.id = marketID;
                    market_obj.completed = false;
                    // This is working

                }
                else{
                    // Catch an error if it exists
                    if(marketDetail[key] == 'Error'){
                        console.log('Oh NOOOO!!!' + marketDetail[key]);
                        alert('Please enter a valid 5 digit US Zip Code');
                        return;
                    }
                }
            }
            markets.push(market_obj);  // This creates an array of market objects
            buildRow(market_obj); // This populates the table with our results.
            // marketDetails(market_obj.id);

        }
    }
    /*setTimeout(function () {
        completeDetails();
    }, 2500);*/
}

/**
 *  Build the header on our table.
 *  todo : Remove id column
 */
function mktTblHeader(){
    var header = marketTable.createTHead();
    th = header.insertRow(0);
    id_th = th.insertCell(0);
    id_th.innerHTML = 'ID';
    name_th = th.insertCell(1);
    name_th.innerHTML = 'Name';
    dist_th = th.insertCell(2);
    dist_th.innerHTML = 'Dist. in Miles';
    find_h = th.insertCell(3);
    find_h.innerHTML = 'Get Directions';
    marketTable.appendChild(th);
}

/**
 * This function accepts a single market instance and appends a row to the table
 * @param {obj} market_obj - is an instance of market()
 */
function buildRow(market_obj){
    tr = document.createElement('tr')
    tr.setAttribute('id', market_obj.id);
    _id = tr.insertCell(0);
    _id.innerHTML = market_obj.id;
    _name = tr.insertCell(1);
    _name.innerHTML = market_obj.name;
    _dist = tr.insertCell(2);
    _dist.innerHTML = market_obj.distance;
    _find = tr.insertCell(3);
    _find.setAttribute('class', 'ctl-btns');
    _find.innerHTML = '<button class="btn btn-outline-info find-button" ' +
        'onclick="marketDetails(' + market_obj.id + ')">Find On Map</button>';
    marketTable.appendChild(tr);


    // put back onclick="marketDetails('+ market_obj.id +')
}

/**
 * Use this once you have an ID from search
 * @param {int} id
 */
function marketDetails(id) {
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        async: false,
        // submit a get request to the restful service mktDetail.
        url: "https://search.ams.usda.gov/farmersmarkets/v1/data.svc/mktDetail?id=" + id,
        dataType: 'jsonp',
        jsonpCallback: 'detailsFilter',
        success: function (response) {
            console.log(response.marketdetails);
            responseList.push(response.marketdetails);
        }
    });
}

// Separate our market details
// Let's refactor this to find an object
function detailsFilter(detailResponse) {
    console.log('We triggered an empty filter');
    // console.log(detailResponse);
    console.log(detailResponse.marketdetails);
    // responseList.push(detailResponse.marketdetails);
    for (var key in detailResponse) {

        console.log(key);
        //alert(key);
        var details = detailResponse[key];
        console.log(details);
        console.log(details.Address);
        mapByAddress(details.Address);
        // alert(details['GoogleLink']);

        console.table(detailResponse);
        console.log('The address is:  ' + details['address']);

        // Put this in the btn controls;
        var searchStr = urlConverter(details.GoogleLink);
        console.log(searchStr);
        var posToFill = getMarketIndex(markets, searchStr[0]);
        // Lets put all of this elements where they are supposed to go
        var idValOfRow = markets[posToFill].id;
        $('#' + idValOfRow + ' .ctl-btns').append('<br><button class="btn btn-outline-success" ' +
            'onclick="getDirections(\'' + details.Address + '\')">Get Directions</button>');
        markets[posToFill].address = details.Address;
        markets[posToFill].loc = searchStr[1];
        markets[posToFill].products = details.Products;
        markets[posToFill].hours = details.Schedule;
        markets[posToFill].completed = true;

    }
}

// Search function to find market by name
function getMarketIndex(marketsList, srchName){
    var elementPos = marketsList.map(function(x) {return x.name; }).indexOf(srchName);
    var objectFound = marketsList[elementPos];
    console.table(objectFound);
    return elementPos;
}

/*********************
 *
 *  ####################
 *  CREATE A BLACKLIST!!
 *
 *  this loop should fill the markets array with all pertinent details
 *
 */


function completeDetails(){
    var fullEntities = 0;
    var index = 0;
    var numToFill = markets.length;
    var blackList = [];
    while(fullEntities < numToFill){
        // This loop will run to dump all values  that are received into the markets array
        if (!(markets[index].completed)) {
        console.log('This market is incomplete');
        marketDetails(markets[index].id);
        }
        else {
        console.log('This Market is complete:' + index);
        console.log(markets[index]);
        fullEntities++;
        blackList.push(index);
        }
    index++;
    }
}

function urlConverter(url){
    var firstBreak = url.split('(%22');
    var secondBreak = firstBreak[1].split('%22)');
    var convertedURL = secondBreak[0];
    var cleanStr = convertedURL.split('+').join(' ');
    var returnArr = [];
    returnArr[0] = cleanStr;
    var coordStr = url.split('?q=');
    var coordEnd = coordStr[1].split('(%22');
    var coordChars = coordEnd[0].split('%2C');
    var lat = coordChars[0];
    var lngRaw = coordChars[1].split('%20');
    var lng = lngRaw[1];
    console.log(lat);
    console.log(lng);
    var MapQuestURL = 'https://www.mapquest.com/search/results?query=' + lat + "%20" + lng;
    returnArr[1] = [lat, lng];
    //console.log(secondBreak[0]);
    return returnArr;

}



