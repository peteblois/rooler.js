import cgi
import os
import datetime
import time
import simplejson as json
import base64

from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import db
from google.appengine.ext.webapp import template

class MainPage(webapp.RequestHandler):
    def get(self):
        path = os.path.join(os.path.dirname(__file__), 'index.htm');

        template_values = {};

        self.response.out.write(template.render(path, template_values));

pages = [
	('/rooler', MainPage),
]

