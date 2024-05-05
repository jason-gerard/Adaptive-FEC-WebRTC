# Adaptive-FEC-WebRTC

### Running the Project
The project ships with the ML model pre-saved for inference, so no training needs to be done.

1. Install project dependencies
```
$ python3 -m venv venv
```
```
$ source venv/bin/activate
```
```
$ python3 -m pip install -r requirements.txt
```
1. Once the requirements are installed you can run the project
```
$ flask run
```
The project will be accessible through `http://127.0.0.1:5000` on your local machine

### Important Files

For the solution the files below contain the implementation details, other files in the project are either for testing or are used for the WebRTC pipeline and their implementations don't affect the project (They are taken from WebRTC and credited in each file).
- `app.py`
- `static/js/error-model.js`
- `static/js/lossy-channel-transform.js`
- `static/js/controls.js`
- `models/generate_dataset.js`

The code used for data analysis that generated all the graphs in the report and presentation can be found in the `graph_sim_results.ipynb` notebook file. You will also need to install pandas, numpy, and matplotlib to run that notebook.

The code for training and testing the models can be found in the `models` directory, see "Training the models" section of the README for more information.

### Training the models

All the models are found in the `models` directory, each model has its own file. There are general purpose scripts like `models/model_utils.py` and `models/generate_dataset.js`. The implementation of the markov chain for the error model is in the `static/js/error-model.js` file.

**Note: to train the ML models you must also have sklearn and pandas installed**

### Generating the dataset

You can generate a new dataset to train the models with if you've changed the transition probabilities or error rates in the error model. You only need to run `node generate_dataset.js`. Inside the file you can adjust how many rows of data will be generated.

### Inference API

When a model is finished training the best hyperparameter selection from grid search will be saved as a pickle. That pickle can be loaded by the inference server to make the live predictions. The path for the model in `app.py` can be changed to load different models.

An example call to the inference API looks like
```
http://127.0.0.1:5000/predict?states=2
```
where the values of states can be a comma delimited string or a single value depending on how many states the inference model was trained with.

### Links

- https://developer.mozilla.org/en-US/docs/Web/API/Insertable_Streams_for_MediaStreamTrack_API
- https://webrtc.github.io/samples/src/content/insertable-streams/video-processing/
- https://github.com/webrtc/samples/blob/gh-pages/src/content/insertable-streams/video-processing/js/simple-transforms.js
- https://chromium.googlesource.com/external/webrtc/+/master/modules/pacing/g3doc/index.md
