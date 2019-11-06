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
    onOpenStart: function(aux) {
      //Si se trata del modal de scan llamo a nuevoCodigo()
      if (aux.id === 'modal-scan') {
        nuevoCodigo();
      }
    },
    onCloseStart: function(aux) {
      if (aux.id === 'modal-scan') {
        window.cancelAnimationFrame(myReq);
      }
    }
  });

  //Side menu ubicado a la derecha.
  const mobile = document.querySelector('#mobile-demo');
  M.Sidenav.init(mobile, { edge: 'right' });

  //Función encargada de dibujar línea alrededor del QR.
  const dibujoLinea = (begin, end, color) => {
    canvas2d.beginPath();
    canvas2d.moveTo(begin.x, begin.y);
    canvas2d.lineTo(end.x, end.y);
    canvas2d.lineWidth = 4;
    canvas2d.strokeStyle = color;
    canvas2d.stroke();
  };

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
        window.cancelAnimationFrame(myReq);
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

  const nuevoCodigo = () => {
    // Use facingMode: environment to attemt to get the front camera on phones
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        video.srcObject = stream;
        video.setAttribute('playsinline', true); // required to tell iOS safari we don't want fullscreen
        video.play();
        myReq = requestAnimationFrame(tick);
      })
      .catch(err => {
        console.log('getUserMedia Error // ' + err);
      });
  };

  searchBtn.addEventListener('click', () => {
    //TODO Buscar en Firestore el valor del textbox qrLeido.value
    console.log('searchBtn');
  });
});
