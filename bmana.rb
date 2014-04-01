class BManaApp < Sinatra::Base

  set :show_exceptions, true
  set :views, 'views'
  set :public_folder, 'public'

  dbyml = YAML.load_file('database.yml')
  defaults = YAML.load_file('defaults.yml')

  if ENV['VCAP_SERVICES'] then
    register Sinatra::GoogleAuth
    #use Sinatra::GoogleAuth::Middleware
    dbconf = dbyml["cloudfoundry"]
    cf = true
  else
    puts "Running local"
    dbconf = dbyml["local"] 
    #dbconf = dbyml["cloudfoundry"]
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
    File.read(File.join('public', 'banners.html'))
  end

  get '/styles' do
    if cf then authenticate end
    File.read(File.join('public', 'styles.html'))
  end

  # returns list of all the site names
  get '/siteselect' do
    if cf then authenticate end
    content_type :json
    coll = db.collection("Sites")
    ret = coll.find({},{:fields=>['site']})

    {
      :message => 'OK',
      :records => ret.to_a
    }.to_json
  end

  # returns list of style names in a site
  get '/typeselect/:site' do
    if cf then authenticate end
    content_type :json
    coll = db.collection("Sites")
    ret = coll.find_one({"site"=>params[:site]})
    {
      :message => 'OK',
      :records => ret['styles'].keys
    }.to_json
  end

  # returns a css style
  get '/style/:site/:type' do
    if cf then authenticate end
    content_type :json
    coll = db.collection("Sites")
    query = {}
    if params[:site] != 'default' then
      query['site'] = params[:site]
    end

    ret = coll.find_one(query)
    
    {
      :message => 'OK',
      :records => ret['styles'][params[:type]]
    }.to_json
  end

  put '/style/:site/:type' do
    if cf then authenticate end
    coll = db.collection("Sites")
    content_type :json

    vars = Rack::Utils.parse_nested_query request.body.read

    coll.update({"site" => params[:site].to_s}, {"$set" => {"styles."+params[:type] => vars['css']}})
    ret = coll.find("site" => params[:site].to_s)

    {
      :message => 'OK',
      :records => ret.to_a
    }.to_json
  end

  get '/banner/:type' do
    if cf then authenticate end
    coll = db.collection("Banners")
    content_type :json

    coll.find_one({'active' => true, 'type' => params[:type]}).to_json
  end

  get '/customfields/:type' do
    if cf then authenticate end
    content_type :json
    coll = db.collection("Banners")
    row = coll.find_one({'type'=>params[:type]})
    if row['fields'] then
      row['fields'].keys.to_json
    else
      {}.to_json
    end
  end

  get '/list' do
    if cf then authenticate end
    coll = db.collection("Banners")
    content_type :json

    query = {}

    if params[:active] then active = true
    else active = false end
    query['active'] = active

    if params[:fields] then
      params[:fields].each do |k,v|
        if v != '' then query["fields." + k] = v end
      end
    end

    query['type'] = params[:typeselect]
    rows = coll.find(query).to_a
    numrows = rows.count

    {
      :query => query, 
      :message => 'OK', 
      :numrows => numrows,
      :records => rows
    }.to_json

  end

  put '/banner/:id' do
    if cf then authenticate end
    coll = db.collection("Banners")
    content_type :json

    vars = Rack::Utils.parse_nested_query request.body.read

    if vars['active'] == 'true' then active = true else active = false end

    coll.update({"_id" => BSON::ObjectId(params[:id].to_s)}, {"$set" => {"active" => active, "body" => vars['body']}})
    ret = coll.find("_id" => BSON::ObjectId(params[:id].to_s))

    {
      :message => 'OK',
      :records => ret.to_a
    }.to_json
  end

end

