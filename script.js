// script.js

// Importar funciones de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-analytics.js";
import { getDatabase, ref, onValue, push, set } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-storage.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA_Qa3AH8ZQB5cMxqhtmBOwr26uwh09c6E",
  authDomain: "interra-5ad36.firebaseapp.com",
  databaseURL: "https://interra-5ad36-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "interra-5ad36",
  storageBucket: "interra-5ad36.appspot.com",
  messagingSenderId: "757837969336",
  appId: "1:757837969336:web:ef4f8b27c40fb25102c14d",
  measurementId: "G-RKFTEN6XG5"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);
const storage = getStorage(app);

// Esperar a que el DOM cargue
document.addEventListener("DOMContentLoaded", () => {
    // Seleccionamos todas las galerías y formularios
    const galleries = document.querySelectorAll(".gallery");
    const uploadForms = document.querySelectorAll(".upload-form");
    const commentsContainers = document.querySelectorAll(".comments-container");
    
    // Para cada ciudad, escuchamos la base de datos y cargamos los datos
    galleries.forEach(gallery => {
        const city = gallery.getAttribute("data-city");
        const cityRef = ref(database, `cities/${city}/posts`);

        onValue(cityRef, (snapshot) => {
            // Limpiar la galería y comentarios antes de volver a cargar
            gallery.innerHTML = "";
            const commentsList = document.querySelector(`.comments-container[data-city="${city}"] .comments-list`);
            if (commentsList) {
                commentsList.innerHTML = "";
            }

            const data = snapshot.val();
            if (data) {
                // data es un objeto con postId: { imageUrl: "...", comment: "..." }
                Object.keys(data).forEach(postId => {
                    const post = data[postId];
                    const { imageUrl, comment } = post;

                    // Crear elemento de imagen en la galería
                    const imgEl = document.createElement("div");
                    imgEl.classList.add("gallery-item");
                    const imgTag = document.createElement("img");
                    imgTag.src = imageUrl;
                    imgTag.alt = comment;
                    imgEl.appendChild(imgTag);
                    gallery.appendChild(imgEl);

                    // Añadir el comentario a la lista de comentarios
                    if (commentsList && comment) {
                        const li = document.createElement("li");
                        li.textContent = comment;
                        commentsList.appendChild(li);
                    }
                });
            }
        });
    });

    // Manejar el envío de formularios (subir imagen + comentario)
    uploadForms.forEach(form => {
        form.addEventListener("submit", (e) => {
            e.preventDefault();

            const city = form.getAttribute("data-city");
            const fileInput = form.querySelector(".image-input");
            const commentInput = form.querySelector(".comment-input");

            const file = fileInput.files[0];
            const comment = commentInput.value.trim();

            if (!file || !comment) {
                alert("Por favor, selecciona una imagen y escribe un comentario antes de subir.");
                return;
            }

            // Referencia de la carpeta de la ciudad en Storage
            const storageReference = storageRef(storage, `cities/${city}/` + file.name);

            // Subir el archivo a Firebase Storage
            uploadBytes(storageReference, file)
                .then(snapshot => {
                    return getDownloadURL(snapshot.ref);
                })
                .then(downloadURL => {
                    // Guardar URL y comentario en la base de datos
                    const cityPostsRef = ref(database, `cities/${city}/posts`);
                    const newPostRef = push(cityPostsRef);
                    set(newPostRef, {
                        imageUrl: downloadURL,
                        comment: comment
                    });

                    // Limpiar el formulario
                    fileInput.value = "";
                    commentInput.value = "";

                    alert("¡Imagen y comentario subidos con éxito!");
                })
                .catch(error => {
                    console.error("Error al subir la imagen:", error);
                    alert("Hubo un error al subir la imagen.");
                });
        });
    });
});
