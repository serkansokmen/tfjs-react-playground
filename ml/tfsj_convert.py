import tensorflowjs as tfjs


tensorflowjs_converter --input_format keras \
                       static/models/nietzsche-zarathustra.h5 \
                       static/models/nietzsche-zarathustra

tensorflowjs_converter --input_format keras \
                       static/models/nietzsche-human-all-too-human.h5 \
                       static/models/nietzsche-human-all-too-human

tensorflowjs_converter --input_format keras \
                       static/models/shakespeare.h5 \
                       static/models/shakespeare

tensorflowjs_converter --input_format keras \
                       static/models/oscar-wilde-soul-of-man.h5 \
                       static/models/oscar-wilde-soul-of-man