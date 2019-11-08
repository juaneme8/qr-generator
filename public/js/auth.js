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
      //setupUI(user);
    });
    db.collection('equipos').onSnapshot(
      (snapshot) => {
        setupGuides(snapshot.docs);
      },
      (err) => console.log(err.message)
    );
  } else {
    //setupUI();
    //setupGuides([]);
  }
});

// AGREGAR INSTRUMENTO
const createForm = document.querySelector('#create-form');
createForm.addEventListener('submit', (e) => {
  e.preventDefault();
  db.collection('equipos')
    .add({
      titulo: createForm.titulo.value,
      descripcion: createForm.descripcion.value
    })
    .then(() => {
      // close the create modal & reset form
      console.log('Insturmento agregado');
      const modal = document.querySelector('#modal-create');
      M.Modal.getInstance(modal).close();
      createForm.reset();
    })
    .catch((err) => {
      console.log(err.message);
    });
});

// REAL-TIME LISTENER
db.collection('equipos').onSnapshot((snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === 'added') {
      renderEquipo(change.doc.data(), change.doc.id);
    }
    if (change.type === 'removed') {
      renderEquipo(change.doc.id);
    }
  });
});

// AGREGAR MATERIAL
const form = document.querySelector('form');
form.addEventListener('submit', (evt) => {
  evt.preventDefault();

  const recipe = {
    name: form.title.value,
    ingredients: form.ingredients.value
  };

  db.collection('recipes')
    .add(recipe)
    .catch((err) => console.log(err));

  form.title.value = '';
  form.ingredients.value = '';
});

// ELIMINAR MATERIAL
const recipeContainer = document.querySelector('.equipos');
recipeContainer.addEventListener('click', (evt) => {
  if (evt.target.tagName === 'I') {
    const id = evt.target.getAttribute('data-id');
    //console.log(id);
    db.collection('recipes')
      .doc(id)
      .delete();
  }
});
