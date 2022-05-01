var shareImageButton = document.querySelector("#share-image-button");
var createPostArea = document.querySelector("#create-post");
var closeCreatePostModalButton = document.querySelector(
  "#close-create-post-modal-btn"
);
var sharedMomentsArea = document.querySelector("#shared-moments");
const postButton = document.querySelector("#post-btn");
const sendPostForm = document.querySelector("form");
const title = document.querySelector("#title");
const _location = document.querySelector("#location");
const snackBar = document.querySelector("#confirmation-toast");

async function openCreatePostModal() {
  createPostArea.style.transform = "translateY(0)";
  console.log("install button clicked");

  const promptEvent = window.deferredPrompt;
  if (!promptEvent) {
    return;
  }

  promptEvent.prompt();
  const result = await promptEvent.userChoice;
  window.deferredPrompt = null;
}

function closeCreatePostModal() {
  createPostArea.style.transform = "translateY(100vh)";
}

shareImageButton.addEventListener("click", openCreatePostModal);

closeCreatePostModalButton.addEventListener("click", closeCreatePostModal);

function clearUI() {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard(post) {
  var cardWrapper = document.createElement("div");
  cardWrapper.className = "shared-moment-card mdl-card mdl-shadow--2dp";
  var cardTitle = document.createElement("div");
  cardTitle.className = "mdl-card__title";
  cardTitle.style.backgroundImage =
    "linear-gradient(0deg, rgba(3,3,12,1) 4%, rgba(3,3,12,0) 45%), url(" +
    post.image +
    ")";
  cardTitle.style.backgroundSize = "cover";
  cardTitle.style.height = "180px";
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement("h2");
  cardTitleTextElement.className = "mdl-card__title-text";
  cardTitleTextElement.textContent = post.title;
  cardTitleTextElement.style.color = "White";
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement("div");
  cardSupportingText.className = "mdl-card__supporting-text";
  cardSupportingText.textContent = post.location;
  cardSupportingText.style.textAlign = "center";

  // if ('caches' in window) {
  //   var saveBotton = document.createElement("button");
  //   saveBotton.textContent = "save";
  //   cardSupportingText.appendChild(saveBotton);
  //   saveBotton.addEventListener("click", checkClick);
  // }

  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function updateUI(data) {
  clearUI();
  const dataArray = Object.values(data);
  dataArray.forEach((post) => {
    createCard(post);
  });
}

const url =
  "https://pwagram-760-default-rtdb.europe-west1.firebasedatabase.app/posts.json";
const postUrl =
  "https://pwagram-760-default-rtdb.europe-west1.firebasedatabase.app/posts.json";
let dataFromWeb = false;

fetch(url)
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    dataFromWeb = true;
    console.log("create from web", data);
    const preData = Object.values(data);
    preData.forEach((item) => {
      writeData("posts", item); //save data in local DB from BackEnd
    });
    updateUI(data); //populate my UI
  });

if ("indexedDB" in window) {
  console.log("Revisando Base Local");
  readAllData("posts").then((data) => {
    if (!dataFromWeb) {
      console.log("aplicado desde Local DB");
      updateUI(data);
    }
  });
}

function sendData(data) {
  fetch(postUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((res) => {
      console.log("Sent Data: ", res);
      //TODO: udate ui
    })
    .catch((err) => {
      console.log("Data can not be sended", err);
      alert("Post no guardado, intente de nuevo");
    });
}

sendPostForm.addEventListener("submit", (event) => {
  event.preventDefault();

  closeCreatePostModal();
  if (title.value.trim() === "" || _location.value === "") return;

  const post = {
    title: title.value,
    location: _location.value,
    id: new Date().toISOString(),
    image:
      "https://upload.wikimedia.org/wikipedia/commons/0/0f/PicoBolivar2.jpg",
  };
  if ("serviceWorker" in navigator && "SyncManager" in window) {
    navigator.serviceWorker.ready
      .then(function (reg) {
        writeData("posts-sync", post)
          .then(() => {
            return reg.sync.register("post-tag");
          })
          .then(() => {
            //mostrar el snackbar
            const data = { message: "Post sended!", timeout: 2000 };
            snackBar.MaterialSnackbar.showSnackbar(data);
          });
      })
      .catch(function (err) {
        // system was unable to register for a sync,
        // this could be an OS-level restriction
        console.log(
          "Por razones del sistema no se pudo registrar el post",
          err
        );
        sendData(post);
      });
  } else {
    // serviceworker/sync not supported
    console.log("Navegador no soporta serviceworkers");
    sendData(post);
  }
});
