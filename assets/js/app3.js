'use strict';

  // Initializes FriendlyChat.
  function FriendlyChat() {
    this.checkSetup();

    // Accesos directos a los elementos DOM
    this.mediaCapture = document.getElementById('mediaCapture');
    this.userPic = document.getElementById('user-pic');
    this.userName = document.getElementById('user-name');
    this.signOutButton = document.getElementById('sign-out');
    this.signInSnackbar = document.getElementById('must-signin-snackbar');
    this.userOnline = document.getElementById('cont-user');

    


    //Guarda el mensaje en el envío del formulario
    this.signOutButton.addEventListener('click', this.signOut.bind(this));

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
