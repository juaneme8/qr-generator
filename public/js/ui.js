const video = document.createElement('video');
const canvas = document.getElementById('canvas');
const canvas2d = canvas.getContext('2d');
const loadingMessage = document.getElementById('loadingMessage');
const qrLeido = document.getElementById('qrLeido');
const searchBtn = document.getElementById('searchBtn');
let myReq = 0;

document.addEventListener('DOMContentLoaded', () => {
  const modals = document.querySelectorAll('.modal');

  //Inicializo todos los modals
  M.Modal.init(modals, {
    //Antes de abrir todos los modals
    onOpenStart: function(aux) {
      //Reviso si se trata del modal de scan
      if (aux.id === 'modal-scan') {
        nuevoCodigo();
      }
    },
    //Antes de cerrar todos los modals
    onCloseStart: function(aux) {
      //Reviso si se trata del modal de scan
      if (aux.id === 'modal-scan') {
        //Detengo la animación por lo que dejo de ingresar a tick()
        window.cancelAnimationFrame(myReq);

        // Detengo el audio y el video de modo que la cámara se apague (círculo rojo en Chrome desaparece)
        localStream.getTracks().forEach(track => {
          track.stop();
        });
      }
    }
  });

  //Inicializo menu lateral derecho
  const sideMenu = document.querySelector('#side-menu');
  M.Sidenav.init(sideMenu, { edge: 'right' });

  //Inicializo menu lateral izquierdo para el agregado de equipos
  const sideForm = document.querySelector('#side-form');
  M.Sidenav.init(sideForm, { edge: 'left' });

  //Función encargada de dibujar línea alrededor del QR.
  const dibujoLinea = (begin, end, color) => {
    canvas2d.beginPath();
    canvas2d.moveTo(begin.x, begin.y);
    canvas2d.lineTo(end.x, end.y);
    canvas2d.lineWidth = 4;
    canvas2d.strokeStyle = color;
    canvas2d.stroke();
  };

  //Función encargada de mostrar un frame del video de la cámara, obtener el valor del QR y recuadrar donde este aparece.
  const tick = () => {
    loadingMessage.innerText = '⌛ Cargando video...';
    let lecturaOK = false;
    //Si tengo suficientes datos
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      //Oculto el mensaje de cargando
      loadingMessage.hidden = true;
      //Muestro el canvas
      canvas.hidden = false;
      //Defino las dimensiones del canvas
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      //Establezco el contenido del canvas
      canvas2d.drawImage(video, 0, 0, canvas.width, canvas.height);
      //Obtentgo una imagen de la porción de video mostrada en este instante
      const imageData = canvas2d.getImageData(0, 0, canvas.width, canvas.height);
      //Chequeo si hay un código presente en esa imagen
      const codigoLeido = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });
      //Si lei un código válido.
      if (codigoLeido) {
        //Dibujo una rectángulo alrededor del código qr
        dibujoLinea(codigoLeido.location.topLeftCorner, codigoLeido.location.topRightCorner, '#07bab2');
        dibujoLinea(codigoLeido.location.topRightCorner, codigoLeido.location.bottomRightCorner, '#07bab2');
        dibujoLinea(codigoLeido.location.bottomRightCorner, codigoLeido.location.bottomLeftCorner, '#07bab2');
        dibujoLinea(codigoLeido.location.bottomLeftCorner, codigoLeido.location.topLeftCorner, '#07bab2');

        //Cargo el textbox con el valor de qr obtenido
        qrLeido.value = codigoLeido.data;

        //Cierro modal
        const modalScan = document.querySelector('#modal-scan');
        M.Modal.getInstance(modalScan).close();

        //Coloco lecturaOK y cancelo animación de modo de dar por terminada la secuencia.
        lecturaOK = true;
      } else {
        //Si no leí un código limpio el textbox
        qrLeido.value = '';
      }
    }
    //Si lecturaOK es false redibujo la pantalla
    if (!lecturaOK) {
      //requestAnimationFrame nos permite redibujar la pantalla
      myReq = requestAnimationFrame(tick);
    }
  };

  //Función invocada por onOpenStart cada vez que hacemos click en la sección ScanQR
  const nuevoCodigo = () => {
    // Use facingMode: environment to attemt to get the front camera on phones
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        //Será utilizado para luego apagar la cámara en el callback de onCloseStart
        window.localStream = stream;

        video.srcObject = stream;
        video.setAttribute('playsinline', true); // required to tell iOS safari we don't want fullscreen
        video.play();
        myReq = requestAnimationFrame(tick);
      })
      .catch(err => {
        console.log('getUserMedia Error // ' + err);
      });
  };

  //Función encargada de buscar en la DB el elemento scaneado.
  searchBtn.addEventListener('click', () => {
    //TODO Buscar en Firestore el valor del textbox qrLeido.value
    console.log('searchBtn');
  });
});

//const contenedorEquipos = document.querySelector('.contenedorEquipos');
const accountDetails = document.querySelector('.account-details');
const adminItems = document.querySelectorAll('.admin');
const loggedOutLinks = document.querySelectorAll('.logged-out');
const loggedInLinks = document.querySelectorAll('.logged-in');

document.addEventListener('DOMContentLoaded', function() {});

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
//Función encargada de mostrar un nuevo equipo. Es invocada por el real-time listener de la db (auth.js).
const renderEquipo = (data, id) => {
  console.log('renderEquipo()');
  const html = `
    <div class="card-panel equipo-item white row" data-id="${id}">
      <img src="/img/dish.svg" alt="foto de equipo">
      <div class="equipo-detalles">
        <div class="equipo-id">${data.id}</div>
        <div class="equipo-sector">${data.sector}</div>
      </div>
      <div class="equipo-eliminar">
        <i class="material-icons" data-id="${id}">delete_outline</i>
      </div>
    </div>
  `;
  contenedorEquipos.innerHTML += html;
};

//ELIMINAR EQUIPO
//Funciónn encargada de eliminar del DOM un equipo al hacer click en el tachito de basura. Es invocada por el real-time listener de la db (auth.js).
const removeEquipo = id => {
  console.log('removeEquipo');
  const equipo = document.querySelector(`.equipo-item[data-id=${id}]`);
  equipo.remove();
};
