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

  get '/styleselect' do
    if cf then authenticate end
    content_type :json
    coll = db.collection("Styles")
    coll.distinct("site").to_json
  end

  get '/style/:site' do
    if cf then authenticate end
    content_type :json
    coll = db.collection("Styles")
    if params[:site] == 'default' then query = eval("{}")
    else query =  eval("{'site'=>'"+params[:site]+"'}")
    end

    coll.find_one(query, {:fields=>['css']}).to_json
  end

  put '/style/:site' do
    if cf then authenticate end
    coll = db.collection("Styles")
    content_type :json

    vars = Rack::Utils.parse_nested_query request.body.read

    coll.update({"site" => params[:site].to_s}, {"$set" => {"css" => vars['css']}})
    ret = coll.find("site" => params[:site].to_s)

    {
      :message => 'OK',
      :record => ret.to_a
    }.to_json
  end

  post '/style/:site' do
    if cf then authenticate end
    coll = db.collection("Styles")
    content_type :json

    vars = Rack::Utils.parse_nested_query request.body.read

    if vars['active'] == 'true' then active = true else active = false end

    coll.insert({"site" => params[:site].to_s}, {"$set" => {"active" => active, "site" => params[:site].to_s, "css" => vars['css'].to_s}})
    ret = coll.find("site" => params[:site].to_s)

    {
      :message => 'OK',
      :record => ret.to_a
    }.to_json
  end

  get '/banner' do
    if cf then authenticate end
    coll = db.collection("Banners")
    content_type :json

    active = 'true'
    coll.find_one({'active' => true}).to_json
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

    if params[:active] then active = 'true'
    else active = 'false' end

    fields = ''

    if params[:fields] then
      params[:fields].each do |k,v|
        if v != '' then fields = fields + ", 'fields." + k + "' => '" + v + "'" end
      end
    end

    #TODO ... frail security
    query = eval("{'active' => " + active + ", 'type' => params[:typeselect]" + fields + "}")
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
      :record => ret.to_a
    }.to_json
  end

end

