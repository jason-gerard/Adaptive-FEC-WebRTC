import pickle
from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

with open("models/model_binaries/RandomForestClassifier.pkl", "rb") as f:
    model = pickle.load(f)


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/predict', methods=['GET'])
def predict():
    # This should line up with the number of previous states that the model was trained with
    prev_states = request.args.get("states").split(",")
    pred = model.predict([prev_states])[0]

    response = jsonify({'state': f"{pred}"})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response