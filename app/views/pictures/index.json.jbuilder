json.array!(@pictures) do |picture|
  json.extract! picture, 
  json.url picture_url(picture, format: :json)
end
