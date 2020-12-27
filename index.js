 // $.ajax({
    //     type: 'post',
    //     url : 'https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyA3r-azrP4HQByczHO54AVMSnLeYkFrqV8',
    //     success : function(data) {
    //         console.log(data);
    //     },
    //     error : function(err) {
    //         console.log(err);
    //     }
    // })

  function distance(lat1, lon1, lat2, lon2) {
    var p = 0.017453292519943295;    // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p)/2 + 
            c(lat1 * p) * c(lat2 * p) * 
            (1 - c((lon2 - lon1) * p))/2;
  
    return  12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
  }

  function areaOfTriangle(a,b,c) {
    let s= (a+b+c)/2;
    // console.log(a,b,c,s);
    return Math.sqrt(s*(s-a)*(s-b)*(s-c));
  }

  function getDrivingDistance(routes) {
    let min=Number.MAX_SAFE_INTEGER;
    for(let route of routes) {
      let length = route.sections[0].summary.length;
      if(length<min)
        min=length;
    }
    return min/1000;
  }
  function getDrivingRoutes(srcLat,srcLong,destLat,destLong) {
    return $.ajax({
      type: 'get',
      url: 'https://router.hereapi.com/v8/routes?',
      data: {
        transportMode:'car',
        origin:srcLat+','+srcLong,
        destination:destLat+','+destLong,
        return:'summary',
        apiKey:'-z8C0vDHHB6SZKqX1I7KDJgb7CfGmTDualOeWgyQJ2w'
      }
    });
  }
function task() {
   
    async function  showPosition(position) {
      let lat = 29.257648;
      let long = 78.500061;
      try{
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
        // console.log(data);
        let restaurants = data.restaurants;
        let nearRestaurantLatitude = restaurants[0].restaurant.location.latitude;
        let nearRestaurantLongitude = restaurants[0].restaurant.location.longitude;
        let farRestaurantLatitude = restaurants[9].restaurant.location.latitude;
        let farRestaurantLongitude = restaurants[9].restaurant.location.longitude;
        let NearToFar = distance(nearRestaurantLatitude,nearRestaurantLongitude,farRestaurantLatitude,farRestaurantLongitude);
        let currentToFar = distance(lat,long,farRestaurantLatitude,farRestaurantLongitude);
        let currentToNear = distance(nearRestaurantLatitude,nearRestaurantLongitude,lat,long);
        let area = areaOfTriangle(NearToFar,currentToFar,currentToNear);
        let time = (NearToFar+currentToFar+currentToNear)/5;

        // console.log(area,time);
        $("#task1 span").text(area+','+time);
         let UserToFarRoutes =   await getDrivingRoutes(lat,long,farRestaurantLatitude,farRestaurantLongitude);
         let UserToNearRoutes =   await getDrivingRoutes(lat,long,nearRestaurantLatitude,farRestaurantLongitude);
         let NearToFarRoutes =   await getDrivingRoutes(nearRestaurantLatitude,nearRestaurantLongitude,farRestaurantLatitude,farRestaurantLongitude);
         //console.log(areaOfTriangle(UserToFarRoute,UserToNearRoute,NearToFarRoute));

        let UserTofarDrivingDistance = getDrivingDistance(UserToFarRoutes.routes);
        let UserToNearDrivingDistance = getDrivingDistance(UserToNearRoutes.routes);
        let NearTofarDrivingDistance = getDrivingDistance(NearToFarRoutes.routes);

        let areaDriving = areaOfTriangle(UserTofarDrivingDistance,UserToNearDrivingDistance,NearTofarDrivingDistance);
        let timeDriving = (UserTofarDrivingDistance+UserToNearDrivingDistance+NearTofarDrivingDistance)/5;
        $("#task2 span").text(areaDriving+','+timeDriving);
    

      }
      catch(err){
        console.log(err);
      }
}
    function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else { 
   console.log("Geolocation is not supported by this browser.");
  }
}

getLocation();
}


$("#getLocation").click(task);