# COMP-691-Project

### Training the models

All the models are found in the `ml-model` directory, each model has its own file. There are general purpose scripts like `model_utils.py` and `generate_dataset.js`. The implementation of the markov chain for the error model is in the `webrtc-testbed/js/error-model.js` file.

### Generating the dataset

You can generate a new dataset to train the models with if you've changed the transition probabilities or error rates in the error model. You only need to run `node generate_dataset.js`. Inside the file you can adjust how many rows of data will be generated.

### Inference API

When a model is finished training the best hyperparameter selection from grid search will be saved as a pickle. That pickle can be loaded by the inference server to make the live predictions. The path for the model in `ml-server/app.py` can be changed to load different models.

An example call to the infrence API looks like
```
http://127.0.0.1:5000/predict?states=2
```
where the values of states can be a comma delimited string or a single value depending how many states the infrence model was trained with.

### Run the project

1. Make sure all JS and Python dependencies are installed

2. Start the infrence ML server
```
cd ml-server
flask run
```

3. Open the WebRTC client through the `index.html` file in the testbed folder
```
file:///Users/jason/Code/COMP-691-Project/webrtc-testbed/index.html
```

### Links
- https://developer.mozilla.org/en-US/docs/Web/API/Insertable_Streams_for_MediaStreamTrack_API
- https://webrtc.github.io/samples/src/content/insertable-streams/video-processing/
- https://github.com/webrtc/samples/blob/gh-pages/src/content/insertable-streams/video-processing/js/simple-transforms.js
- https://chromium.googlesource.com/external/webrtc/+/master/modules/pacing/g3doc/index.md