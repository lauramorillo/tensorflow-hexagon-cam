# TensorFlow.js Example: Transfer Learning to play Hexagon via the Webcam

This example shows you how to predict poses from a webcam using transfer
learning.

In this example, we'll use a pretrained [MobileNet](https://github.com/tensorflow/tfjs-examples/tree/master/mobilenet) model and train another model
using an internal mobilenet activation to predict 4 different classes from the
webcam defined by the user.

For the Hexagon game we have used [this Hexagon repository](http://schlipak.github.io/Hexagon.js) and the training is based on [this Tensorflow.js example](hhttps://js.tensorflow.org/tutorials/webcam-transfer-learning.html)
