require 'yaml'
require 'json'
require 'cf-runtime'
require 'sinatra'
require 'sinatra/base'

if ENV['VCAP_SERVICES'] then
  authyml = YAML.load_file('auth.yml')
  authconf = authyml["google"]
  ENV['GOOGLE_AUTH_DOMAIN'] = authconf['GOOGLE_AUTH_DOMAIN']
  require 'sinatra/google-auth'
end

require 'mongo'
require 'haml'
require './bmana'

map '/' do
  run BManaApp
end
