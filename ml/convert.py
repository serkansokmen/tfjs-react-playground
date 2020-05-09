import keras
from keras.models import load_model, model_from_json
from keras.utils import CustomObjectScope
from keras.initializers import glorot_uniform
import h5py

import coremltools
import argparse
import json


# construct the argument parser and parse the arguments
ap = argparse.ArgumentParser()
# ap.add_argument("-m", "--model", required=True,
#                 help="path to trained model")
# ap.add_argument("-j", "--json",
#                 help="path to trained model")
ap.add_argument("-k", "--key", required=True,
                help="dataset key")
args = vars(ap.parse_args())

# if args["json"]:
#     with open(args["json"]) as json_file:
#         data = json.load(json_file)
#         with CustomObjectScope({'GlorotUniform': glorot_uniform()}):
#             model = model_from_json(json.dumps(data))
# load the trained model
# print("[INFO] loading model:" + args["model"])
# f = h5py.File(args["model"], 'r')
# print(f.attrs.get('keras_version'))
# print(f)
with CustomObjectScope({'GlorotUniform': glorot_uniform()}):
    coreml_model = coremltools.converters.keras.convert("models/" + args["key"] + ".h5")
    coreml_model.save('mnist_cnn_keras.mlmodel')

# model = load_model(args["model"])
# for layer in model.layers:
#     print(layer)
