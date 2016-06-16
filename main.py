
import io
import json
import logging
import os
import pdb
import traceback

from logging import config

from functools import wraps

from flask import (
    Flask,
    request,
    send_file,
    send_from_directory,
)


app = Flask(__name__)
config.fileConfig('logger.conf')
logger = logging.getLogger('cnn-tagger')


@app.route('/', methods=['GET'])
def home():
    return send_from_directory('www', 'index.html')


@app.route('/js/<path:path>')
def send_js(path):
    return send_from_directory('www/js', path)


@app.route('/css/<path:path>')
def send_css(path):
    return send_from_directory('www/css', path)


def _error_as_json(ex, status=500, trace=True):
    logger.error(" -- Got exception in the tagger backend!")
    logger.error(" -- %r" % ex)
    if trace:
        logger.error(traceback.format_exc())
    return json.dumps({'error': "{}".format(ex)}), status


if __name__ == '__main__':
    app.run('0.0.0.0', port=5152)
