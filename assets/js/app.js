


/*agregar comentario a la imagen*/
function enabled() {
	var comments = document.getElementById('comment').value;
	var cantidad = 140 - comments.length;
	var espacios = comments.split(' ').length - 1;
	var enters = comments.split('\n').length - 1;
	document.getElementById('p1').innerHTML=cantidad;

	if (comments.length == 0 || cantidad < 0 || espacios + enters == comments.length){
		document.getElementById('btn').disabled = true;
		document.getElementById('btn').className = 'btn-disabled';
	}else{
		document.getElementById('btn').disabled = false;
		document.getElementById('btn').className = 'btn-enabled';
	}
}
function add(){
	/*tomo texto de textareaa*/
	var comments= document.getElementById('comment').value;
	/*limpealo del textarea*/
	document.getElementById('comment').value = '';
	/*el div en donde estan los comentario el html*/
	var newComments= document.createElement('div');
	var cont = document.getElementById('cont');
	var hora =moment().format('LT');

	var paragraph= document.createElement('p');
	var nodoText=document.createTextNode(comments);
	var nodoHour=document.createTextNode(hora);
	paragraph.appendChild(nodoText);
	/*agregar todos los huerfanos al padre(contenedor)*/
	newComments.appendChild(paragraph);
	newComments.appendChild(nodoHour);
	cont.appendChild(newComments);
	/*volver a preguntar por cada comentario*/
	enabled();
}
function numColor() {
	var comments = document.getElementById('comment').value;
	var cantidad = 140 - comments.length;
	if (cantidad < 20 && cantidad >=10){
		document.getElementById('tell').className = 'tell-2';
	}else if(cantidad < 10 && cantidad >=0){
		document.getElementById('tell').className = 'tell-3';
	}else{
		document.getElementById('tell').className = 'tell-1';
	}
}

function agrandar(){
	var comments = document.getElementById('comment').value;
	var linea = comments.split('\n');
	var lineas_necesarias = parseInt(comments.length/37) + 1;
		if((linea.length - 1 + lineas_necesarias) > 3){
			document.getElementById('comment').rows = linea.length - 1 + lineas_necesarias;
		} else {
			document.getElementById('comment').rows = 3;	
		}
}

function enabled() {
	var comments = document.getElementById('comment').value;
	var cantidad = 140 - comments.length;
	document.getElementById('p1').innerHTML=cantidad;
	if (comments.length == 0 || cantidad < 0){
		document.getElementById('btn').disabled = true;
	}else{
		document.getElementById('btn').disabled = false;
	}
}

/*mapa*/
var map;
var map2;
var service;
var infowindow;
var positionMap;
var markers = [];
var cols = 0;

function initialize() {
  var santiago = new google.maps.LatLng(-33.4691,-70.6420);

  map = new google.maps.Map(document.getElementById('map'), {
    center: santiago,
    zoom: 15
  });
            
  infowindow = new google.maps.InfoWindow();
  service = new google.maps.places.PlacesService(map);

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      var request = {
        location: pos,
        radius: '500',
        types: ['cultura']
      };
      positionMap = pos;
      service.nearbySearch(request, callback);

      infowindow.setPosition(pos);
      infowindow.setContent('Location found.');
      map.setCenter(pos);
    }, function() {
      setDefaultMap(santiago);
    });
  } else {
    setDefaultMap(santiago);
  }

  $('#modalLocal').on('shown.bs.modal', function (e) {
    google.maps.event.trigger(map2, "resize");
    console.log("entre!!")
  })
}

/*function setDefaultMap(defaultPosition) {
  var request = {
    location: defaultPosition,
    radius: '500',
    types: ['restaurant']
  };
  positionMap = defaultPosition;
  service.nearbySearch(request, callback);
}


function setSearchMap(search) {
  var request = {
    location: positionMap,
    radius: '500',
    types: ['restaurant'],
    keyword: [search]
  };

  service.nearbySearch(request, callback);
}


function callback(results, status) {
  console.log("RESULTADO", results);
  // Se limipia la lista de fotos
  $('#listFood').html("");
  cols = 0;
  // Se limpia los marker del mapa
  removeMarker();
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      var place = results[i];
      createMarker(place);
      createElement(place, i + 1);
    }
  }
}

function createMarker(place) {
  var placeLoc = place.geometry.location;
  //var image = 'https://userscontent2.emaze.com/images/9ee8f6cc-2b63-4759-bd7c-6492f61b815f/7710ad823f3e2aab72620a4c0c77066d.png';
  var marker = new google.maps.Marker({
    map: map,
    position: placeLoc,
    //icon: image
  });

  markers.push(marker);

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
  });
}

function removeMarker() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
}*/