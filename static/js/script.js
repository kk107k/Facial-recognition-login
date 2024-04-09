
let video;
let canvas;
let nameInput;

function init() {
    video = document.getElementById('video');
    canvas = document.getElementById('canvas');
    nameInput = document.getElementById('name');

    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            video.srcObject = stream;
        })
        .catch((error) => {
            console.log("error accessing webcam", error);
        });
}


function capture() {
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.style.display = 'block';
    video.style.display = 'none';
}

function register() {
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const photo = dataURItoBlob(canvas.toDataURL());

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('photo', photo, `${username}.jpg`);

    fetch('/register', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Registered successfully.");
            window.location.href = "/success?user_name=" + username;
        } else {
            alert("Registration failed: " + data.error);
        }
    })
    .catch(error => {
        console.log("Error registering user", error);
    });
}



function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const photo = dataURItoBlob(canvas.toDataURL());

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('photo', photo, 'login.jpg');

    fetch('/login', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Login successful.");
            window.location.href = "/success?user_name=" + username;
        } else {
            alert("Login failed: " + data.error);
        }
    })
    .catch(error => {
        console.log("Error logging in", error);
    });
}

function logout() {
    fetch('/logout', {
        method: 'GET'
    })
    .then(response => {
        if(response.ok) {  // Check if the response status is OK (200-299)
            window.location.href = "/";  // Redirect to the home page
        }
    })
    .catch(error => {
        console.log("Error logging out", error);
    });
}



function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(",")[1]);
    const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}

init()

