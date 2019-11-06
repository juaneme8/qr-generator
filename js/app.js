const video = document.createElement('video');
const canvas = document.getElementById('canvas');
const canvas2d = canvas.getContext('2d');
const loadingMessage = document.getElementById('loadingMessage');
const qrLeido = document.getElementById('qrLeido');
const searchBtn = document.getElementById('searchBtn');
let myReq = 0;

document.addEventListener('DOMContentLoaded', () => {
  const modals = document.querySelectorAll('.modal');
  M.Modal.init(modals, {
    onOpenStart: function(aux) {
      if (aux.id === 'modal-scan') {
        nuevoCodigo();
      }
    }
  });

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
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      loadingMessage.hidden = true;
      canvas.hidden = false;

      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      canvas2d.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas2d.getImageData(0, 0, canvas.width, canvas.height);
      const codigoLeido = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });
      if (codigoLeido) {
        //Código leído
        dibujoLinea(codigoLeido.location.topLeftCorner, codigoLeido.location.topRightCorner, '#07bab2');
        dibujoLinea(codigoLeido.location.topRightCorner, codigoLeido.location.bottomRightCorner, '#07bab2');
        dibujoLinea(codigoLeido.location.bottomRightCorner, codigoLeido.location.bottomLeftCorner, '#07bab2');
        dibujoLinea(codigoLeido.location.bottomLeftCorner, codigoLeido.location.topLeftCorner, '#07bab2');

        qrLeido.value = codigoLeido.data;

        //Cierro modal
        const modalScan = document.querySelector('#modal-scan');
        M.modal.getInstance(modalScan).close();

        //Coloco lecturaOK y cancelo animación de modo de dar por terminada la secuencia.
        lecturaOK = true;
        window.cancelAnimationFrame(myReq);
      } else {
        qrLeido.value = '';
      }
    }
    if (!lecturaOK) {
      //requestAnimationFrame nos permite redibujar la pantalla cada vez detectamos un nuevo QR.
      myReq = requestAnimationFrame(tick);
    }
  };

  const readBtn = document.querySelector('#readBtn');

  const nuevoCodigo = () => {
    // Use facingMode: environment to attemt to get the front camera on phones
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        video.srcObject = stream;
        video.setAttribute('playsinline', true); // required to tell iOS safari we don't want fullscreen
        video.play();
        myReq = requestAnimationFrame(tick);
      })
      .catch((err) => {
        console.log('getUserMedia Error // ' + err);
      });
  };

  searchBtn.addEventListener('click', () => {
    //TODO Buscar en Firestore el valor del textbox qrLeido.value
    console.log('searchBtn');
  });
});
