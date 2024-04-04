import os  # Importing the os module to interact with the operating system
import datetime  # Importing the datetime module to handle date and time
import cv2  # Importing OpenCV library for image processing
from flask import Flask, request, jsonify, render_template  # Importing necessary Flask modules
import face_recognition  # Importing the face_recognition library for face recognition

app = Flask(__name__)  # Creating a Flask application instance

registered_data = {}  # Dictionary to store registered data (photo filename associated with the provided name)

@app.route('/')  # Decorator to specify the URL route for the index page
def index():
    return render_template('index.html')  # Rendering the index.html template

@app.route('/register', methods=['POST'])  # Decorator to specify the URL route and HTTP method for registration
def register():
    name = request.form.get('name')  # Getting the name from the form data
    photo = request.files['photo']  # Getting the photo from the form data

    if not name:  # Checking if name is provided
        return jsonify({'success': False, 'error': 'Name is required'})  # Returning an error response if name is missing

    if not photo:  # Checking if photo is provided
        return jsonify({'success': False, 'error': 'Photo is required'})  # Returning an error response if photo is missing

    uploads_folder = os.path.join(os.getcwd(), 'static', 'uploads')  # Creating path for storing uploaded photos
    if not os.path.exists(uploads_folder):  # Checking if the uploads folder exists
        os.makedirs(uploads_folder)  # Creating the uploads folder if it doesn't exist
        
    photo_filename = f'{name}.jpg'  # Generating a unique filename for the photo
    photo_path = os.path.join(uploads_folder, photo_filename)  # Creating the full path for saving the photo
    photo.save(photo_path)  # Saving the photo to the specified path

    registered_data[photo_filename] = name  # Associating the photo filename with the provided name

    response = {'success': True, 'name': name}  # Creating a success response with the registered name
    return jsonify(response)  # Returning the response as JSON

@app.route('/login', methods=['POST'])  # Decorator to specify the URL route and HTTP method for login
def login():
    photo = request.files['photo']  # Getting the photo from the form data

    uploads_folder = os.path.join(os.getcwd(), 'static', 'uploads')  # Creating path for storing uploaded photos
    if not os.path.exists(uploads_folder):  # Checking if the uploads folder exists
        os.makedirs(uploads_folder)  # Creating the uploads folder if it doesn't exist
    login_filename = os.path.join(uploads_folder, 'login_face.jpg')  # Creating the path for saving the login photo
    photo.save(login_filename)  # Saving the login photo to the specified path

    login_image = cv2.imread(login_filename)  # Reading the login photo
    gray_image = cv2.cvtColor(login_image, cv2.COLOR_BGR2GRAY)  # Converting the image to grayscale

    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')  # Loading the Haar Cascade classifier for face detection
    faces = face_cascade.detectMultiScale(gray_image, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))  # Detecting faces in the image

    if len(faces) == 0:  # Checking if no faces are detected in the login photo
        response = {'success': False}  # Creating a failure response
        return jsonify(response)  # Returning the failure response as JSON

    login_image = face_recognition.load_image_file(login_filename)  # Loading the login photo for face recognition
    login_face_encodings = face_recognition.face_encodings(login_image)  # Encoding the faces in the login photo

    for filename, name in registered_data.items():  # Iterating over registered data (photo filename and associated name)
        registered_photo = os.path.join(uploads_folder, filename)  # Creating the path for the registered photo
        if not os.path.exists(registered_photo):  # Skipping if the registered photo doesn't exist
            continue

        registered_image = face_recognition.load_image_file(registered_photo)  # Loading the registered photo for face recognition
        registered_face_encodings = face_recognition.face_encodings(registered_image)  # Encoding the faces in the registered photo

        if len(registered_face_encodings) > 0 and len(login_face_encodings) > 0:  # Checking if both login and registered photos have face encodings
            matches = face_recognition.compare_faces(registered_face_encodings, login_face_encodings[0])  # Comparing the face encodings

            if any(matches):  # Checking if any of the face encodings match
                response = {'success': True, 'name': name}  # Creating a success response with the registered name
                return jsonify(response)  # Returning the success response as JSON

    response = {'success': False}  # Creating a failure response if no match is found
    return jsonify(response)  # Returning the failure response as JSON

@app.route('/success')  # Decorator to specify the URL route for the success page
def success():
    user_name = request.args.get('user_name')  # Getting the username from the query parameters
    return render_template('success.html', user_name=user_name)  # Rendering the success.html template with the username

if __name__ == '__main__':
    app.run(debug=True)  # Running the Flask application in debug mode
