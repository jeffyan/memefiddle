class FiddlesController < ApplicationController
  before_action :set_fiddle, only: [:show, :edit, :update, :destroy]

  # GET /
  def root
  end

  # GET /pages/newimage.html
  def newimage
    respond_to do |format|
      format.html { render "fiddles/partials/newimage", :layout => false  }
    end
  end
  # GET /pages/image.html
  def image
    respond_to do |format|
      format.html { render "fiddles/partials/image", :layout => false  }
    end
  end
  # GET /pages/browse.html
  def browse
    respond_to do |format|
      format.html { render "fiddles/partials/browse", :layout => false  }
    end
  end

  # GET /fiddles
  # GET /fiddles.json
  def index
    @fiddles = Fiddle.all
    render json: @fiddles
  end

  # GET /fiddles/1
  # GET /fiddles/1.json
  def show
    render json: @fiddle
  end

  # GET /fiddles/new
  def new
    @fiddle = Fiddle.new
  end

  # GET /fiddles/1/edit
  def edit
  end

  # POST /fiddles
  # POST /fiddles.json
  def create
    @fiddle = Fiddle.new(fiddle_params)
    data = params[:imgdata]
    image_data = Base64.decode64(data['data:image/png;base64,'.length .. -1])

    @fiddle.set_picture(image_data)
    @fiddle.save
    
    respond_to do |format|
      if @fiddle.save
        format.json { render json: {uniquecode: @fiddle.uniquecode} }
      else
        format.json { render json: @fiddle.errors, status: :unprocessable_entity }
      end
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_fiddle
      @fiddle = Fiddle.where(:uniquecode => params[:id]).first;
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def fiddle_params
      params[:fiddle].permit(:json, :revision, :uniquecode)#.permit(:revision).permit(:uniquecode)
    end
end
