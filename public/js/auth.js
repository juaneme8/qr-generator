//CREACIÓN DE USUARIO
const signupForm = document.querySelector('#signup-form');
signupForm.addEventListener('submit', e => {
  e.preventDefault();

  // Obtener info de usuario
  const email = signupForm['signup-email'].value;
  const password = signupForm['signup-password'].value;

  // Registro de nuevo usuario
  auth
    .createUserWithEmailAndPassword(email, password)
    .then(cred => {
      console.log('Usuario Creado');
      //Agrego a la DB en la colección usuarios, la bio con el mismo id que fue entregado al usuario
      return db
        .collection('usuarios')
        .doc(cred.user.uid)
        .set({
          bio: signupForm['signup-bio'].value
        });
    })
    //Una vez creado el usuario cierro el modal y limpio los campos
    .then(() => {
      //Obtengo una referencia del modal
      const modal = document.querySelector('#modal-signup');
      //Cierro el modal
      M.Modal.getInstance(modal).close();
      //Limpio el formulario
      signupForm.reset();
      //Limpio el mensaje de error en caso de que lo hubiera.
      signupForm.querySelector('.error').innerHTML = '';
    })
    .catch(err => {
      //Muestro el mensaje de error obtenido
      signupForm.querySelector('.error').innerHTML = err.message;
    });
});

// LOGOUT
const logout = document.querySelector('#logout');
logout.addEventListener('click', e => {
  console.log('Usuario Desconectado');
  e.preventDefault();
  auth.signOut();
});

//LOGIN
const loginForm = document.querySelector('#login-form');
loginForm.addEventListener('submit', e => {
  e.preventDefault();

  // Obtengo los datos del usuario del formulario
  const email = loginForm['login-email'].value;
  const password = loginForm['login-password'].value;

  auth
    .signInWithEmailAndPassword(email, password)
    .then(cred => {
      console.log('Usuario Conectado');
      // Obtengo una referencia del modal
      const modal = document.querySelector('#modal-login');
      //Cierro el modal
      M.Modal.getInstance(modal).close();
      //Limpio el formulario
      loginForm.reset();
      //Limpio los errores pues el login fue exitoso
      loginForm.querySelector('.error').innerHTML = '';
    })
    .catch(err => {
      //Muestro el mensaje de error obtenido
      loginForm.querySelector('.error').innerHTML = err.message;
    });
});

// LISTEN AUTH CHANGES
auth.onAuthStateChanged(user => {
  console.log('onAuthStateChanged: ' + user);
  //Si estoy logueado
  if (user) {
    user.getIdTokenResult().then(idTokenResult => {
      //Cargo el valor del custom claim
      user.admin = idTokenResult.claims.admin;
      renderUI(user);
    });
  } else {
    //Si no estoy logueado, limpio los datos que sólo los usuarios logueados pueden ver
    renderUI();
    //La limpieza de los equipos se realiza automáticamente al desloguearse ya que el contenedor tiene la clase logged-in
  }
});

// AGREGAR EQUIPO (1)
const agregarEquipo = document.querySelector('#agregar-equipo');

//Función invocada al hacer submit en el left side-menu.
agregarEquipo.addEventListener('submit', evt => {
  evt.preventDefault();

  //Conformo el objeto que guardaré
  const equipo = {
    id: agregarEquipo.id.value,
    sector: agregarEquipo.sector.value
  };

  //Agrego equipo a la DB
  db.collection('equipos')
    .add(equipo)
    .catch(err => console.log(err));

  //Limpio el formulario
  agregarEquipo.id.value = '';
  agregarEquipo.sector.value = '';
});

// ELIMINAR EQUIPO (2)
const contenedorEquipos = document.querySelector('.contenedorEquipos');
contenedorEquipos.addEventListener('click', evt => {
  if (evt.target.tagName === 'I') {
    const id = evt.target.getAttribute('data-id');
    console.log('db rem');
    db.collection('equipos')
      .doc(id)
      .delete();
  }
});

//Obtengo todos los equipos

// REAL-TIME LISTENER (3)
//Función que de acuerdo a los cambios en la db actualiza el DOM (mediante ui.js).
db.collection('equipos').onSnapshot(snapshot => {
  snapshot.docChanges().forEach(change => {
    //Ante un agregado a la DB
    if (change.type === 'added') {
      renderEquipo(change.doc.data(), change.doc.id);
    }
    //Ante una eliminación en la db
    if (change.type === 'removed') {
      console.log('rt removed');
      removeEquipo(change.doc.id);
    }
  });
});
