//To roundoff the decimal digits
function roundNumber(num, dec) {
  return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
} 

//To calculate the straight lie distance between two points given by lat and lang
function distance(lat1, lon1, lat2, lon2) {
  var p = 0.017453292519943295;    // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p)/2 + 
          c(lat1 * p) * c(lat2 * p) * 
          (1 - c((lon2 - lon1) * p))/2;

  return  12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

//To find the area of triangle given three sides
function areaOfTriangle(a,b,c) {
  let s= (a+b+c)/2;
  // console.log(a,b,c,s);
  return Math.sqrt(s*(s-a)*(s-b)*(s-c));
}

//To find the minimum driving distance between various routes possible
function getDrivingDistance(routes) {
  let min=Number.MAX_SAFE_INTEGER;
  for(let route of routes) {
    let length = route.sections[0].summary.length;
    if(length<min)
      min=length;
  }
  return min/1000;
}

//To find all the driving routes between src and dest 
function getDrivingRoutes(srcLat,srcLong,destLat,destLong) {
  return $.ajax({
    type: 'get',
    url: 'https://router.hereapi.com/v8/routes?',
    data: {
      transportMode:'car',
      origin:srcLat+','+srcLong,
      destination:destLat+','+destLong,
      return:'summary',
      apiKey:'OECluS58Z5CNu-57jY6nVoJQfPK2yHFkMjMT13rJxeQ'
    }
  });
}


// This is main function which will calculate the required answer for task1 and task2
function task() {

    //This function actually calculate the tasks answers
    async function  calculateAreaAndTime(currentPosition) {

      //Your current latitude and longitude
      let lat = currentPosition.coords.latitude;
      let long = currentPosition.coords.longitude;

      //Showing them on web page
      $("#coordinates span").text(lat+' , '+long);

      try{

        //Ajax request to get 10 nearby restaurants
        let data = await $.ajax({
          type: 'get',
          url: 'https://developers.zomato.com/api/v2.1/search',
          data: {
            count:10,
            lat:lat,
            lon:long,
            sort:'real_distance',
            order:'asc'
          },
          beforeSend: function(xhr){xhr.setRequestHeader('user-key', 'eb2aee6ff2b4a1e5417653c52719cad4');}
        });

        //all 10 restaurants
        let restaurants = data.restaurants;
        

        //restaurants lat and long
        let nearRestaurantLatitude = restaurants[0].restaurant.location.latitude;
        let nearRestaurantLongitude = restaurants[0].restaurant.location.longitude;
        let farRestaurantLatitude = restaurants[9].restaurant.location.latitude;
        let farRestaurantLongitude = restaurants[9].restaurant.location.longitude;
        
        //TASK 1-

        //straight distances between points
        let NearToFar = distance(nearRestaurantLatitude,nearRestaurantLongitude,farRestaurantLatitude,farRestaurantLongitude);
        let currentToFar = distance(lat,long,farRestaurantLatitude,farRestaurantLongitude);
        let currentToNear = distance(nearRestaurantLatitude,nearRestaurantLongitude,lat,long);

        //required area for task1
        let area = areaOfTriangle(NearToFar,currentToFar,currentToNear);

        //required time for task1
        let time = (NearToFar+currentToFar+currentToNear)/5;
         
        //showing data to web page
        let table = $("table")[0];
        table.rows[1].cells[1].innerText = roundNumber(area,6);
        table.rows[1].cells[2].innerText = roundNumber(time,6);


        //TASK 2-

        //Driving routes between all the points
        let UserToFarRoutes =   await getDrivingRoutes(lat,long,farRestaurantLatitude,farRestaurantLongitude);
        let UserToNearRoutes =   await getDrivingRoutes(lat,long,nearRestaurantLatitude,farRestaurantLongitude);
        let NearToFarRoutes =   await getDrivingRoutes(nearRestaurantLatitude,nearRestaurantLongitude,farRestaurantLatitude,farRestaurantLongitude);
        
         //minimum driving distance between all the points
        let UserTofarDrivingDistance = getDrivingDistance(UserToFarRoutes.routes);
        let UserToNearDrivingDistance = getDrivingDistance(UserToNearRoutes.routes);
        let NearTofarDrivingDistance = getDrivingDistance(NearToFarRoutes.routes);

        //Required area and time for task 2
        let areaDriving = areaOfTriangle(UserTofarDrivingDistance,UserToNearDrivingDistance,NearTofarDrivingDistance);
        let timeDriving = (UserTofarDrivingDistance+UserToNearDrivingDistance+NearTofarDrivingDistance)/5;
        
        //Showing data to web page
        table.rows[2].cells[1].innerText = roundNumber(areaDriving,6);
        table.rows[2].cells[2].innerText = roundNumber(timeDriving,6);
    
      }
      catch(err){
        console.log(err);
      }
}

  //To calculate the User current Coordinates
  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(calculateAreaAndTime);
    } else { 
    console.log("Geolocation is not supported by this browser.");
    }
}

getLocation();
}

//Event Listener for button
$("#getResult").click(task);