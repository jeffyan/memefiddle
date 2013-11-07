require 'tempfile'
require 'open-uri'

class Fiddle < ActiveRecord::Base
	validates_presence_of :json
	validates :revision, :numericality => { :only_integer => true }
	validates_uniqueness_of :uniquecode

	before_validation :default_values
	def default_values
		self.revision ||= 1
		self.uniquecode ||= (0...8).map { (65 + rand(26)).chr }.join
	end

	# image shit goes here
	has_attached_file :finalimage, styles: {
	    thumb: '150x150>',
	    regular: '300x300>'
		}

	def set_picture(attachment)
	  
	  temp_file = Tempfile.open(['temp', '.png'])

	  begin
	  	temp_file.binmode
	  	temp_file.write(attachment)
		temp_file.rewind
		self.finalimage = temp_file
	  ensure
	    temp_file.close
	    temp_file.unlink
	  end
	end

	def get_picture
		url = self.finalimage.url
		Rails.logger.debug 'url is '+ url.to_s
		pic  = open(url) {|f| f.read }

		return pic
	end
end
