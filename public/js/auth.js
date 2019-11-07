//SIGN UP
const signupForm = document.querySelector('#signup-form');
signupForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Obtener info de usuario
  const email = signupForm['signup-email'].value;
  const password = signupForm['signup-password'].value;

  // Registro de nuevo usuario & add firestore data
  auth
    .createUserWithEmailAndPassword(email, password)
    .then((cred) => {
      return db
        .collection('usuarios')
        .doc(cred.user.uid)
        .set({
          bio: signupForm['signup-bio'].value
        });
    })
    .then(() => {
      const modal = document.querySelector('#modal-signup');
      //Cierro el modal
      M.Modal.getInstance(modal).close();
      //Limpio el formulario
      signupForm.reset();
      //Limpio el mensaje de error.
      signupForm.querySelector('.error').innerHTML = '';
    })
    .catch((err) => {
      //Muestro mensaje de error
      signupForm.querySelector('.error').innerHTML = err.message;
    });
});

//LOGIN
const loginForm = document.querySelector('#login-form');
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // get user info
  const email = loginForm['login-email'].value;
  const password = loginForm['login-password'].value;

  // log the user in
  auth
    .signInWithEmailAndPassword(email, password)
    .then((cred) => {
      // close the signup modal & reset form
      const modal = document.querySelector('#modal-login');
      M.Modal.getInstance(modal).close();
      loginForm.reset();
      loginForm.querySelector('.error').innerHTML = '';
    })
    .catch((err) => {
      loginForm.querySelector('.error').innerHTML = err.message;
    });
});

// LOGOUT
const logout = document.querySelector('#logout');
logout.addEventListener('click', (e) => {
  e.preventDefault();
  auth.signOut();
});

// LISTEN AUTH CHANGES
auth.onAuthStateChanged((user) => {
  if (user) {
    user.getIdTokenResult().then((idTokenResult) => {
      user.admin = idTokenResult.claims.admin;
      setupUI(user);
    });
    db.collection('materiales').onSnapshot(
      (snapshot) => {
        setupGuides(snapshot.docs);
      },
      (err) => console.log(err.message)
    );
  } else {
    setupUI();
    setupGuides([]);
  }
});

// CREAR NUEVO INSTRUMENTO
const createForm = document.querySelector('#create-form');
createForm.addEventListener('submit', (e) => {
  e.preventDefault();
  db.collection('guides')
    .add({
      title: createForm.title.value,
      content: createForm.content.value
    })
    .then(() => {
      // close the create modal & reset form
      const modal = document.querySelector('#modal-create');
      M.Modal.getInstance(modal).close();
      createForm.reset();
    })
    .catch((err) => {
      console.log(err.message);
    });
});
