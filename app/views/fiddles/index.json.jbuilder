json.array!(@fiddles) do |fiddle|
  json.extract! fiddle, 
  json.url fiddle_url(fiddle, format: :json)
end
