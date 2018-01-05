// (function() {
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyCNeBsGHzJYaBLtaKbGXAKoCwvpNQjn7zw",
    authDomain: "mi-red-social-1515006266015.firebaseapp.com",
    databaseURL: "https://mi-red-social-1515006266015.firebaseio.com",
    projectId: "mi-red-social-1515006266015",
    storageBucket: "",
    messagingSenderId: "120754645224"
  };
  firebase.initializeApp(config);

  var userPic = document.getElementById('user-pic');
  var userName = document.getElementById('user-name');
  
  $('#btn-login').click(login);
  $('#btn-singUp').click(singUp);
  $('#icoGoogle').click(ingresoGoogle);
  $('#icoFacebook').click(ingresoFacebook);
  // $('#cerrarSesion').click(cerrar);

  var database = firebase.database();
  var userConect = null;
  function singUp() {
    var email = $('#signUpEmail').val();
    var password = $('#signUpPass').val();
    var auth = firebase.auth();

    var promise = auth.createUserWithEmailAndPassword(email, password);
    promise.catch(e => console.log(e.message))
  }

  function login() {
    var email = $('#email').val();
    var password = $('#password').val();
    var auth = firebase.auth();

    var promise = auth.signInWithEmailAndPassword(email, password);
    promise.then(function(user) {
      window.location.href = 'index2.html';
      console.log('logged in:', user);
    }).catch(function(error){
      console.log(error);
    })
  }
// })
var userName=document.getElementById('user-name');
var userImage=document.getElementById('user-pic')

function ingresoGoogle() {
  if(!firebase.auth().currentUser){
    var provider = new firebase.auth.GoogleAuthProvider();

    provider.addScope('https://www.googleapis.com/auth/contacts.readonly');


    firebase.auth().signInWithPopup(provider).then(function(result){

      var token = result.credential.accesstoken;

      var user = result.user;
      var name = result.user.displayName;

      console.log(user);
      agregarUserBD(user);
      window.location.href = 'index2.html';

    }).catch(function(error) {
      console.log("error", error.message);
      var errorCode = error.Code;

      var errorMessage = error.message;

      var errorEmail = error.email;

      var errorCredential = error.credential

      if(errorCode === 'auth/account-exists-with-different-credential'){
        alert('Es el mismo usuario')
      }
    });
  }else {
    firebase.auth().signOut();
  }
}

function ingresoFacebook() {
  if(!firebase.auth().currentUser){
    var provider = new firebase.auth.FacebookAuthProvider();

    provider.addScope('public_profile');


    firebase.auth().signInWithPopup(provider).then(function(result){

      var token = result.credential.accesstoken;

      var user = result.user;
      console.log(user);
      agregarUserBD(user);
      /*var name = result.user.displayName;*/

      window.location.href = 'index2.html';

    }).catch(function(error) {
      console.log("error", error.message);
      var errorCode = error.Code;

      var errorMessage = error.message;

      var errorEmail = error.email;

      var errorCredential = error.credential

      if(errorCode === 'auth/account-exists-with-different-credential'){
        alert('Es el mismo usuario')
      }
    });
  }else {
    firebase.auth().signOut();
  }
}

function InicializarFire () {
  firebase.auth().onAuthStateChanged(function(user){
    if(user){
      console.log("USER!!!!", user);
      var displayName = user.displayName;
      var userPhoto = user.photoURL;
      var userEmail = user.email;

      /*userName.textContent = displayName;*/
      userConect = database.ref("/user");
      // agregarUserBD(user);
      /*child_added:*/ //escuchar
      /*child_change:*//*evento para capturar cuando se realiza un modificacion*/
      /*child_remove:*///remover un registro

      /*.on*/
      userConect.on('child_added', function(data){
        console.log("ha ingreado a la sala"+data.val().name);
      });
      userConect.on('child_removed', function(data){
        console.log(data.val().name+"Ha cerrado sesion")
      })
      /*database.ref("/user").on*/
    }
  });
}
function agregarUserBD(user){

  var uid = user.uid;
  var name = user.displayName;
  var photoURL = user.photoURL;
  var conectados = userConect.push({
    uid:uid,
    name:name,
    photoURL:photoURL
  });

  conectKey = conectado.key;
  firebase.database().ref('users/' + user.uid).set({
      firstName: firstName,
      lastName: lastName
  })
}

function EliminarUserBD(){
  database.ref("/user/"+conectKey).remove();
}

window.onload = function(){
  InicializarFire();
}

/*var user = {
  email: "carolinasguzman@gmail.com"
  password: "123"
}
*/
/*ref.createUser(user, function(error)) {
  if(error){
    console.log(error);
  }else {
    console.log("esta bn");
  }
}*/
/*ref.authWithPassword(user);*/
/*autentificado*/
/*ref.onAuth(function(data){
  if(data){
    console.log('el user autentificado', data.iud);
  }else {
    console.log('no tengo user')
  }
})
ref.unauth();*/

