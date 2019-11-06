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
