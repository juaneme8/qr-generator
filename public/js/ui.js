//todo para evitar dubplicado
//const contenedorEquipos = document.querySelector('.contenedorEquipos');
const accountDetails = document.querySelector('.account-details');
const adminItems = document.querySelectorAll('.admin');
const loggedOutLinks = document.querySelectorAll('.logged-out');
const loggedInLinks = document.querySelectorAll('.logged-in');

document.addEventListener('DOMContentLoaded', function() {
  // nav menu
  const menus = document.querySelectorAll('.side-menu');
  M.Sidenav.init(menus, { edge: 'right' });
  // add recipe form
  const forms = document.querySelectorAll('.side-form');
  M.Sidenav.init(forms, { edge: 'left' });
});

const renderUI = user => {
  //Si el usuario está logueado
  if (user) {
    //Si es admin
    if (user.admin) {
      //Muestro todos los elementos sólo visibles por admin
      adminItems.forEach(item => (item.style.display = 'block'));
    }
    // Obtengo los datos de firestore (no de Auth)
    db.collection('usuarios')
      .doc(user.uid)
      .get()
      .then(doc => {
        const html = `
        <div>Logged in as ${user.email}</div>
        <div>${doc.data().bio}</div>
        <div class="pink-text">${user.admin ? 'Admin' : ''}</div>
      `;
        accountDetails.innerHTML = html;
      });
    // Muestro los elementos visibles para usuarios logueados y oculto los de usuarios deslogueados.
    loggedInLinks.forEach(item => (item.style.display = 'block'));
    loggedOutLinks.forEach(item => (item.style.display = 'none'));
  }
  //El usuario no está logueado
  else {
    // Limpio la información
    accountDetails.innerHTML = '';
    // toggle user elements
    adminItems.forEach(item => (item.style.display = 'none'));
    loggedInLinks.forEach(item => (item.style.display = 'none'));
    loggedOutLinks.forEach(item => (item.style.display = 'block'));
  }
};

//RENDER EQUIPO
const renderEquipo = (data, id) => {
  const html = `
    <div class="card-panel recipe white row" data-id="${id}">
      <img src="/img/dish.svg" alt="foto de equipo">
      <div class="recipe-details">
        <div class="recipe-title">${data.id}</div>
        <div class="recipe-ingredients">${data.descripcion}</div>
      </div>
      <div class="recipe-delete">
        <i class="material-icons" data-id="${id}">delete_outline</i>
      </div>
    </div>
  `;
  contenedorEquipos.innerHTML += html;
};

//ELIMINAR EQUIPO
const removeEquipo = id => {
  const equipo = document.querySelector(`.recipe[data-id=${id}]`);
  equipo.remove();
};
