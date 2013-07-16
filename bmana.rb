class BManaApp < Sinatra::Base

  set :show_exceptions, true
  set :views, 'views'
  set :public_folder, 'public'

  dbyml = YAML.load_file('database.yml')

  if ENV['VCAP_SERVICES'] then
    register Sinatra::GoogleAuth
    #use Sinatra::GoogleAuth::Middleware
    dbconf = dbyml["cloudfoundry"]
    cf = true
  else
    puts "Running local"
    dbconf = dbyml["local"] 
    cf = false
  end

  db = Mongo::MongoClient.new(dbconf["host"], dbconf["port"]).db(dbconf["database"])
  if !dbconf["password"].nil? then auth = db.authenticate(dbconf["username"], dbconf["password"]) end

  not_found { haml :error404 }

  time = Time.new
  timeutc = time.utc()
  time_id = BSON::ObjectId.from_time(timeutc)

  get '/' do
    if cf then authenticate end
    File.read(File.join('public', 'index.html'))
    #haml :index
  end

  get '/typeselect' do
    if cf then authenticate end
    content_type :json
    coll = db.collection("Banners")
    coll.distinct('type').to_json
  end

  get '/customfields/:type' do
    if cf then authenticate end
    content_type :json
    coll = db.collection("Banners")
    row = coll.find_one({'type'=>params[:type]})
    row['fields'].keys.to_json
  end

  get '/list' do
    if cf then authenticate end
    coll = db.collection("Banners")
    content_type :json

    if params[:active] then active = true
    else active = false end

    fields = {}

    params[:fields].each do |k,v|
      if v != '' then fields[k] = v end
    end

    query = {'active' => active, 'type' => params[:typeselect], 'fields' => fields}
    rows = coll.find(query).to_a
    numrows = rows.count

    {
      :message => 'OK', 
      :numrows => numrows,
      :records => rows
    }.to_json

  end

end
