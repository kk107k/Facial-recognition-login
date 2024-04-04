
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

function register(){
    const name = nameInput.value;
    const photo = dataURItoBlob(canvas.toDataURL());

    if(!name || !photo){
        alert("Name and photo are required.");
        return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('photo', photo, `${name}.jpg`);

    fetch('/register', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if(data.success){
            alert("Registered successfully.");
            const userName = data.name; // Retrieve the associated name from the response
            window.location.href = `/success?user_name=${userName}`;
        }else{
            alert("Registration failed.");
        }
    })
    .catch(error => {
        console.log("Error registering user", error);
    });
}



function login(){
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const photo = dataURItoBlob(canvas.toDataURL());

    if(!photo){
        alert("photo required please")
        return
    }

    const formData = new FormData();
    formData.append('photo', photo, `login.jpg`);

    fetch('/login', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Login successful");
            const userName = data.name;  // Extracting the name from the response
            window.location.href = `/success?user_name=${userName}`;  // Redirecting to the success page with the username
        } else {
            alert("Login failed, please try again");
        }
    })
    .catch(error => {
        console.log("Error logging in user", error);
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

