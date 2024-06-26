/*
 *  Copyright (c) 2020 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

/* global MediaStreamTrackProcessor, MediaStreamTrackGenerator */
if (typeof MediaStreamTrackProcessor === 'undefined' ||
    typeof MediaStreamTrackGenerator === 'undefined') {
  alert(
      'Your browser does not support the experimental MediaStreamTrack API ' +
      'for Insertable Streams of Media. See the note at the bottom of the ' +
      'page.');
}

/* global CameraSource */ // defined in camera-source.js
/* global CanvasSource */ // defined in canvas-source.js
/* global CanvasTransform */ // defined in canvas-transform.js
/* global PeerConnectionSink */ // defined in peer-connection-sink.js
/* global PeerConnectionSource */ // defined in peer-connection-source.js
/* global Pipeline */ // defined in pipeline.js
/* global NullTransform, DropTransform, TestDropTransform, DelayTransform */ // defined in simple-transforms.js
/* global VideoSink */ // defined in video-sink.js
/* global VideoSource */ // defined in video-source.js
/* global WebGLTransform */ // defined in webgl-transform.js
/* global WebCodecTransform */ // defined in webcodec-transform.js

/**
 * Allows inspecting objects in the console. See console log messages for
 * attributes added to this debug object.
 * @type {!Object<string,*>}
 */
let debug = {};

/**
 * FrameTransformFn applies a transform to a frame and queues the output frame
 * (if any) using the controller. The first argument is the input frame and the
 * second argument is the stream controller.
 * The VideoFrame should be closed as soon as it is no longer needed to free
 * resources and maintain good performance.
 * @typedef {function(
 *     !VideoFrame,
 *     !TransformStreamDefaultController<!VideoFrame>): !Promise<undefined>}
 */
let FrameTransformFn; // eslint-disable-line no-unused-vars

/**
 * Creates a pair of MediaStreamTrackProcessor and MediaStreamTrackGenerator
 * that applies transform to sourceTrack. This function is the core part of the
 * sample, demonstrating how to use the new API.
 * @param {!MediaStreamTrack} sourceTrack the video track to be transformed. The
 *     track can be from any source, e.g. getUserMedia, RTCTrackEvent, or
 *     captureStream on HTMLMediaElement or HTMLCanvasElement.
 * @param {!FrameTransformFn} transform the transform to apply to sourceTrack;
 *     the transformed frames are available on the returned track. See the
 *     implementations of FrameTransform.transform later in this file for
 *     examples.
 * @param {!AbortSignal} signal can be used to stop processing
 * @return {!MediaStreamTrack} the result of sourceTrack transformed using
 *     transform.
 */
// eslint-disable-next-line no-unused-vars
function createProcessedMediaStreamTrack(sourceTrack, transform, signal) {
  // Create the MediaStreamTrackProcessor.
  /** @type {?MediaStreamTrackProcessor<!VideoFrame>} */
  let processor;
  try {
    processor = new MediaStreamTrackProcessor(sourceTrack);
  } catch (e) {
    alert(`MediaStreamTrackProcessor failed: ${e}`);
    throw e;
  }

  // Create the MediaStreamTrackGenerator.
  /** @type {?MediaStreamTrackGenerator<!VideoFrame>} */
  let generator;
  try {
    generator = new MediaStreamTrackGenerator('video');
  } catch (e) {
    alert(`MediaStreamTrackGenerator failed: ${e}`);
    throw e;
  }

  const source = processor.readable;
  const sink = generator.writable;

  // Create a TransformStream using our FrameTransformFn. (Note that the
  // "Stream" in TransformStream refers to the Streams API, specified by
  // https://streams.spec.whatwg.org/, not the Media Capture and Streams API,
  // specified by https://w3c.github.io/mediacapture-main/.)
  /** @type {!TransformStream<!VideoFrame, !VideoFrame>} */
  const transformer = new TransformStream({transform});

  // Apply the transform to the processor's stream and send it to the
  // generator's stream.
  const promise = source.pipeThrough(transformer, {signal}).pipeTo(sink);

  promise.catch((e) => {
    if (signal.aborted) {
      console.log(
          '[createProcessedMediaStreamTrack] Shutting down streams after abort.');
    } else {
      console.error(
          '[createProcessedMediaStreamTrack] Error from stream transform:', e);
    }
    source.cancel(e);
    sink.abort(e);
  });

  debug['processor'] = processor;
  debug['generator'] = generator;
  debug['transformStream'] = transformer;
  console.log(
      '[createProcessedMediaStreamTrack] Created MediaStreamTrackProcessor, ' +
          'MediaStreamTrackGenerator, and TransformStream.',
      'debug.processor =', processor, 'debug.generator =', generator,
      'debug.transformStream =', transformer);

  return generator;
}

/**
 * The current video pipeline. Initialized by initPipeline().
 * @type {?Pipeline}
 */
let pipelineStandard;
let pipelineCorrected;
let pipelineCorrectedML;

/**
 * Sets up handlers for interacting with the UI elements on the page.
 */
function initUI() {
  // Setup source camera
  const source = new CameraSource();
  source.setVisibility(true);
  
  /**
   * Initializes/reinitializes the pipeline. Called on page load and after the
   * user chooses to stop the video source.
   */
  async function initPipeline(pipeline, name) {
    if (pipeline) pipeline.destroy();
    pipeline = new Pipeline();
    debug = {pipeline};
    
    // Set source
    pipeline.updateSource(source);
    
    // Set transform
    if (name === "Standard") {
      pipeline.updateTransform(new StandardLossyTransform());
    } else if (name === "Corrected") {
      pipeline.updateTransform(new CorrectedLossyTransform());
    } else if (name === "CorrectedML") {
      pipeline.updateTransform(new CorrectedMLLossyTransform());
    }

    // Set sink
    pipeline.updateSink(new PeerConnectionSink(name));

    console.log(`[initPipeline] Created new Pipeline ${name}`, 'debug.pipeline =', pipeline);
  }

  initPipeline(pipelineStandard, "Standard");
  initPipeline(pipelineCorrected, "Corrected");
  initPipeline(pipelineCorrectedML, "CorrectedML");
}

window.onload = initUI;
