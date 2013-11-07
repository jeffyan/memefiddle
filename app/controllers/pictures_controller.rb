class PicturesController < ApplicationController
  # GET /pictures
  # GET /pictures.json
  def index
    @pictures = Picture.all

    render json: @pictures
  end

  # GET /pictures/1
  # GET /pictures/1.json
  def show
    @picture = Picture.find(params[:id])

    render json: @picture
  end

  # POST /pictures
  # POST /pictures.json
  def create
    unless params[:file].content_type.include? "image" 
      render(json: { error: "uploaded file is not an image" }, status: 500) and return
    end

    @picture = Picture.new()
    @picture.set_picture(params[:file])
    @picture.save

    # file extension
    pattern = /(image\/)(.*)/
    matches = params[:file].content_type.match pattern
    file_ext = matches[2]
    
    # render json: { path: @picture.image.url }
    render json: { path: "http://" + request.host + "/userpics/" + @picture.id.to_s + "." + file_ext }
  end

  # PATCH/PUT /pictures/1
  # PATCH/PUT /pictures/1.json
  def update
    @picture = Picture.find(params[:id])

    if @picture.update(params[:picture])
      head :no_content
    else
      render json: @picture.errors, status: :unprocessable_entity
    end
  end

  # DELETE /pictures/1
  # DELETE /pictures/1.json
  def destroy
    @picture = Picture.find(params[:id])
    @picture.destroy

    head :no_content
  end

  def preview
    @fiddle = Fiddle.where(uniquecode: params[:id]).first
    
    response.headers["Content-Type"] = "image/png"
    render :text => @fiddle.get_picture
  end

  def userpics
    @picture = Picture.find(params[:id])
    render :text => @picture.get_picture
  end
end
