require 'cf-runtime'
require 'sinatra'
require 'sinatra/base'
require 'mongo'
require 'haml'
require './bmana'

map '/' do
  run BManaApp
end
