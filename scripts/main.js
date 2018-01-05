
'use strict';

// Initializes FriendlyChat.
function FriendlyChat() {
  this.checkSetup();

  // Accesos directos a los elementos DOM
  this.messageList = document.getElementById('messages');
  this.messageForm = document.getElementById('message-form');
  this.messageInput = document.getElementById('message');
  this.submitButton = document.getElementById('submit');
  this.submitImageButton = document.getElementById('submitImage');
  this.imageForm = document.getElementById('image-form');
  this.mediaCapture = document.getElementById('mediaCapture');
  this.userPic = document.getElementById('user-pic');
  this.userName = document.getElementById('user-name');
  this.signOutButton = document.getElementById('sign-out');
  this.signInSnackbar = document.getElementById('must-signin-snackbar');
  this.userOnline = document.getElementById('cont-user');

  $('#oculto').hide();
  $('#oculto2').hide();


  //Guarda el mensaje en el envío del formulario
  this.messageForm.addEventListener('submit', this.saveMessage.bind(this));
  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  // this.signInButton.addEventListener('click', this.signIn.bind(this));

  //Alternar para el botón
  var buttonTogglingHandler = this.toggleButton.bind(this);
  this.messageInput.addEventListener('keyup', buttonTogglingHandler);
  this.messageInput.addEventListener('change', buttonTogglingHandler);

  // Events for image upload.
  this.submitImageButton.addEventListener('click', function(e) {
    e.preventDefault();
    this.mediaCapture.click();
  }.bind(this));
  this.mediaCapture.addEventListener('change', this.saveImageMessage.bind(this));

  this.initFirebase();
}

// Configura accesos directos a las características de Firebase e inicia la autenticación de base de firebase.
FriendlyChat.prototype.initFirebase = function() {
  this.auth = firebase.auth();
  this.database = firebase.database();

  this.storage = firebase.storage();
  // this.store = firebase.storage();

  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};

// Carga el historial de mensajes de chat y escucha los próximos.
FriendlyChat.prototype.loadMessages = function() {
  // Reference to the /messages/ database path.
    this.messagesRef = this.database.ref('messages');
    // Make sure we remove all previous listeners.
    this.messagesRef.off();

    // Loads the last 12 messages and listen for new ones.
    var setMessage = function(data) {
      var val = data.val();
      console.log(data.key, val.name, val.text, val.photoUrl, val.photoID);
      this.displayMessage(data.key, val.name, val.text, val.photoUrl, val.photoID);
    }.bind(this);
    this.messagesRef.limitToLast(10).on('child_added', setMessage);
    this.messagesRef.limitToLast(10).on('child_changed', setMessage);
};

// Carga el historial de post y escucha los próximos.
FriendlyChat.prototype.loadPhotos = function() {
  // Reference to the /messages/ database path.
    this.photoRef = this.database.ref('photos');
    // Make sure we remove all previous listeners.
    this.photoRef.off();
    var infoPhoto = '<div class="row"><div class="col-md-4"><div class="row"><div class="col-md-6 fa fa-heart" aria-hidden="true"></div><div class="col-md-6"><p>123 like</p></div></div></div><div class="col-md-4"><div class="row"><div class="col-md-6 fa fa-heart" aria-hidden="true"></div><div class="col-md-6"><p>123 comment</p></div></div></div><div class="col-md-4"><div class="row"><div class="col-md-6 fa fa-heart" aria-hidden="true"></div><div class="col-md-6"><p>123 galeria</p></div></div></div></div><div id="cont"></div></div>';

    // Loads the last 12 messages and listen for new ones.
    var setPhoto = function(data) {
      var val = data.val();
      var photoElement = document.getElementById('imgPhoto'+data.key);
      if (!photoElement) {
        var commentPhoto = '<div class="row"><div id="messageBox'+data.key+'"></div><form id="formMessage'+data.key+'" action="#" data-photo="'+data.key+'">';
        commentPhoto += '<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
        commentPhoto += '    <input id="messageInput'+data.key+'" class="mdl-textfield__input" type="text">';
        commentPhoto += '  </div>';
        commentPhoto += '  <button data-photo="'+data.key+'"  type="submit" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect">';
        commentPhoto += '    Enviar';
        commentPhoto += '  </button>';
        commentPhoto += '</form></div>';
        $('#post1').append('<img class="imgPost" id="imgPhoto'+data.key+'" src="'+FriendlyChat.LOADING_IMAGE_URL+'">'+infoPhoto+commentPhoto);
      }
      console.log("PHOTO!!!!!!!!!!!", data.key, val.name, val.imageUrl);
      if (val.imageUrl) {
        if (val.imageUrl.startsWith('gs://')) {
          this.storage.refFromURL(val.imageUrl).getMetadata().then(function(metadata) {
            $('.loadPhoto').hide();
            document.getElementById('imgPhoto'+data.key).src = metadata.downloadURLs[0];
            document.getElementById('formMessage'+data.key).addEventListener('submit', this.saveMessagePhoto.bind(this));
          }.bind(this));
        }
      
      }
    }.bind(this);
    this.photoRef.limitToLast(2).on('child_added', setPhoto);
    this.photoRef.limitToLast(2).on('child_changed', setPhoto);
};

// Loads chat messages history and listens for upcoming ones.
FriendlyChat.prototype.loadUser = function() {
  // Reference to the /messages/ database path.
    this.userRef = this.database.ref('user');
    // Make sure we remove all previous listeners.
    this.userRef.off();

    var countUsersLogged = 0;

    // Loads the last 12 messages and listen for new ones.
    var setUser = function(data) {
      var val = data.val();
      var li = '<li><div class="row"><div class="col-md-1"><img class="imgPerfil" src="'+val.photoURL+'"></div><div class="col-md-8">'+val.name+'</div>';
      if (val.online) {
        countUsersLogged++;
        $("#cont-user").html(countUsersLogged);
        li += '<div class="col-md-2"><i class="fa fa-check-circle" aria-hidden="true"></i></div></div>';
      }
      li += '</li>';
      $("#user-online").append(li);
      console.log("CONETADO!!!!!!!!!!", val, data);
      // this.displayMessage(data.key, val.name, val.text, val.photoUrl, val.imageUrl);
    }.bind(this);
    this.userRef.on('child_added', setUser);
    this.userRef.on('child_changed', setUser);
};

// Saves a new message on the Firebase DB.
FriendlyChat.prototype.saveMessage = function(e) {
  e.preventDefault();
    // Check that the user entered a message and is signed in.
    if (this.messageInput.value && this.checkSignedInWithMessage()) {
      var currentUser = this.auth.currentUser;
      // Add a new message entry to the Firebase Database.
      this.messagesRef.push({
        name: currentUser.displayName,
        text: this.messageInput.value,
        photoUrl: currentUser.photoURL || '/images/profile_placeholder.png'
      }).then(function() {
        // Clear message text field and SEND button state.
        FriendlyChat.resetMaterialTextfield(this.messageInput);
        this.toggleButton();
      }.bind(this)).catch(function(error) {
        console.error('Error writing new message to Firebase Database', error);
      });
    }
};

// Saves a new message on the Firebase DB.
FriendlyChat.prototype.saveMessagePhoto = function(e) {
  e.preventDefault();
  var photoID = $(e.target).data('photo');
  var message = $("#messageInput"+photoID).val();
  var currentUser = this.auth.currentUser;

  this.messagesRef.push({
    name: currentUser.displayName,
    text: message,
    photoUrl: currentUser.photoURL || '/images/profile_placeholder.png',
    photoID : photoID
  }).then(function() {
    // Clear message text field and SEND button state.
    FriendlyChat.resetMaterialTextfield(this.messageInput);
    this.toggleButton();
  }.bind(this)).catch(function(error) {
    console.error('Error writing new message to Firebase Database', error);
  });
  console.log($("#messageInput"+photoID).val(), photoID);
};

// Sets the URL of the given img element with the URL of the image stored in Cloud Storage.
FriendlyChat.prototype.setImageUrl = function(imageUri, imgElement) {
  imgElement.src = imageUri;
  // If the image is a Cloud Storage URI we fetch the URL.
  if (imageUri.startsWith('gs://')) {
    imgElement.src = FriendlyChat.LOADING_IMAGE_URL; // Display a loading image first.
    this.storage.refFromURL(imageUri).getMetadata().then(function(metadata) {
      imgElement.src = metadata.downloadURLs[0];
    });
  } else {
    imgElement.src = imageUri;
  }

  // TODO(DEVELOPER): If image is on Cloud Storage, fetch image URL and set img element's src.
};

FriendlyChat.prototype.saveImageMessage = function(event) {
  event.preventDefault();
  var file = event.target.files[0];

  // Clear the selection in the file picker input.
  this.imageForm.reset();

  // Check if the file is an image.
  if (!file.type.match('image.*')) {
    var data = {
      message: 'You can only share images',
      timeout: 2000
    };
    this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
    return;
  }

  // Check if the user is signed-in
  if (this.checkSignedInWithMessage()) {

    // We add a message with a loading icon that will get updated with the shared image.
    var currentUser = this.auth.currentUser;
    this.photoRef.push({
      name: currentUser.displayName,
      imageUrl: FriendlyChat.LOADING_IMAGE_URL,
      photoUrl: currentUser.photoURL || '/images/profile_placeholder.png'
    }).then(function(data) {

      // Upload the image to Cloud Storage.
      var filePath = currentUser.uid + '/' + data.key + '/' + file.name;
      return this.storage.ref(filePath).put(file).then(function(snapshot) {

        // Get the file's Storage URI and update the chat message placeholder.
        var fullPath = snapshot.metadata.fullPath;
        return data.update({imageUrl: this.storage.ref(fullPath).toString()});
      }.bind(this));
    }.bind(this)).catch(function(error) {
      console.error('There was an error uploading a file to Cloud Storage:', error);
    });
  }
};


// Signs-out of Friendly Chat.
FriendlyChat.prototype.signOut = function() {
  var currentUser = this.auth.currentUser;

  if (currentUser) {
    var uid = currentUser.uid;
    var name = currentUser.displayName;
    var photoURL = currentUser.photoURL;
    this.database.ref("/user/"+uid).set({
      uid:uid,
      name:name,
      photoURL:photoURL,
      online:false
    });
    this.auth.signOut();
  }
  window.location.href = 'index.html';
};

// Triggers when the auth state change for instance when the user signs-in or signs-out.
FriendlyChat.prototype.onAuthStateChanged = function(user) {
  if (user) { // User is signed in!
    // Get profile pic and user's name from the Firebase user object.
    var profilePicUrl = user.photoURL;
    var userName = user.displayName;

    // Set the user's profile pic and name.
    console.log("USER!!!!!", user, profilePicUrl);
    this.userPic.style.backgroundImage = 'url(' + profilePicUrl + ')';
    this.userName.textContent = userName;

    // Show user's profile and sign-out button.
    this.userName.removeAttribute('hidden');
    this.userPic.removeAttribute('hidden');
    this.signOutButton.removeAttribute('hidden');

    

    // We load currently existing chant messages.
    this.loadPhotos();


    this.loadUser();
    this.loadMessages();

    // We save the Firebase Messaging Device token and enable notifications.
    this.saveMessagingDeviceToken();
  } else { // User is signed out!
    // Hide user's profile and sign-out button.
    this.userName.setAttribute('hidden', 'true');
    this.userPic.setAttribute('hidden', 'true');
    this.signOutButton.setAttribute('hidden', 'true');

    // Show sign-in button.
    this.signInButton.removeAttribute('hidden');
  }
};

// Returns true if user is signed-in. Otherwise false and displays a message.
FriendlyChat.prototype.checkSignedInWithMessage = function() {
  if (this.auth.currentUser){
    return true;
  }

  // Display a message to the user using a Toast.
  var data = {
    message: 'You must sign-in first',
    timeout: 2000
  };
  this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
  return false;
};

// Saves the messaging device token to the datastore.
FriendlyChat.prototype.saveMessagingDeviceToken = function() {
  // TODO(DEVELOPER): Save the device token in the realtime datastore
};

// Requests permissions to show notifications.
FriendlyChat.prototype.requestNotificationsPermissions = function() {
  // TODO(DEVELOPER): Request permissions to send notifications.
};

// Resets the given MaterialTextField.
FriendlyChat.resetMaterialTextfield = function(element) {
  element.value = '';
  element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
};

// Template for messages.
FriendlyChat.MESSAGE_TEMPLATE =
    '<div class="message-container">' +
      '<div class="spacing"><div class="pic"></div></div>' +
      '<div class="message"></div>' +
      '<div class="name"></div>' +
    '</div>';

// A loading image URL.
FriendlyChat.LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif';

// Displays a Message in the UI.
FriendlyChat.prototype.displayMessage = function(key, name, text, picUrl, photoID) {
  var div = document.getElementById(key);
  // If an element for that message does not exists yet we create it.
  if (!div) {
    var container = document.createElement('div');
    container.innerHTML = FriendlyChat.MESSAGE_TEMPLATE;
    div = container.firstChild;

    div.setAttribute('id', key);
    document.getElementById('messageBox'+photoID).appendChild(div);
  }
  if (picUrl) {
    div.querySelector('.pic').style.backgroundImage = 'url(' + picUrl + ')';
  }
  div.querySelector('.name').textContent = name;
  var messageElement = div.querySelector('.message');
  if (text) { // If the message is text.
    messageElement.textContent = text;
    // Replace all line breaks by <br>.
    messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
  }
  // Show the card fading-in.
  setTimeout(function() {div.classList.add('visible')}, 1);
  this.messageList.scrollTop = this.messageList.scrollHeight;
  this.messageInput.focus();
};

// Enables or disables the submit button depending on the values of the input
// fields.
FriendlyChat.prototype.toggleButton = function() {
  if (this.messageInput.value) {
    this.submitButton.removeAttribute('disabled');
  } else {
    this.submitButton.setAttribute('disabled', 'true');
  }
};

// Checks that the Firebase SDK has been correctly setup and configured.
FriendlyChat.prototype.checkSetup = function() {
  if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions and make ' +
        'sure you are running the codelab using `firebase serve`');
  }
};

window.onload = function() {
  window.friendlyChat = new FriendlyChat();


};

/*agregar usuarios activos*/



/*function UserConectados(name, uid) {
  var li = '<li id="'+uid+'" class="mdl-list__item><span class="mdl-lidt__item-primary_content><i class="material-icons mdl-list__item-icon">person</i>'
            +name+ '</span></li>'
  $('#user-online').append(li);
}*/


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

/*falta localizar por filtro*/
var map;
var map2;
var service;
var infowindow;
var positionMap;
var markers = [];

function initialize() {
  var santiago = new google.maps.LatLng(-33.4691,-70.6420);
  markers = [];

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
        types: ['restaurant']
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

function setDefaultMap(defaultPosition) {
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
    keyword: [search]
  };


  service.nearbySearch(request, callback);
}

function filtroSearchMap(positionMap, searchCategoria) {


  map = new google.maps.Map(document.getElementById('map'), {
    center: positionMap,
    zoom: 15
  });

  console.log(positionMap, searchCategoria);
  var request = {
    location: positionMap,
    radius: '500',
    types: [searchCategoria]
  };


  service.nearbySearch(request, callback);
}




function callback(results, status) {
  console.log("RESULTADO", results);
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
}

function createElement(place, index) {
  console.log(place.name, place.photos);
}

$('#btnSearch').click(search);
function search() {
  setSearchMap($('#inputSearch').val());
}

$('#btnSearchFiltros').click(searchFiltros);
function searchFiltros() {
  // Obtenemos la dirección y la asignamos a una variable
  var address = $('#lugar').val();
  // Creamos el Objeto Geocoder
  var geocoder = new google.maps.Geocoder();
  // Hacemos la petición indicando la dirección e invocamos la función
  // geocodeResult enviando todo el resultado obtenido
  geocoder.geocode({ 'address': address}, geocodeResult);


   
  function geocodeResult(results, status) {
    console.log(results, status);
      // Verificamos el estatus
      if (status == 'OK') {
        positionMap = results[0].geometry.location;
        filtroSearchMap(results[0].geometry.location, $('#categoria').val());

      } else {
          // En caso de no haber resultados o que haya ocurrido un error
          // lanzamos un mensaje con el error
          alert("Geocoding no tuvo éxito debido a: " + status);
      }
  }
}




