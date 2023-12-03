import pickle
from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

# Initialize the ML model used for inference by loading the pickle containing the model
with open("models/model_binaries/RandomForestClassifier.pkl", "rb") as f:
    model = pickle.load(f)


@app.route('/')
def home():
    # The route for the test bed page, this gives the HTML
    return render_template('index.html')


@app.route('/predict', methods=['GET'])
def predict():
    # This should line up with the number of previous states that the model was trained with
    prev_states = request.args.get("states").split(",")
    # Get the prediction of the next error state from the ML model
    pred = model.predict([prev_states])[0]

    # Create a JSON res object from the prediction
    response = jsonify({'state': f"{pred}"})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response
