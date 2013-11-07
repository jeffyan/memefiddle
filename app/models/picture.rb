require 'tempfile'
require 'open-uri'

class Picture < ActiveRecord::Base
	has_attached_file :image, styles: {
	    thumb: '150x150>',
	    regular: '300x300>'
  	}

	def set_picture(attachment)
	  pattern = /(image\/)(.*)/
	  matches = attachment.content_type.match pattern
	  file_ext = matches[2]
	  # Rails.logger.debug "file extension #{file_ext}" 

	  temp_file = Tempfile.open(['temp', '.'+file_ext])

	  begin
	  	temp_file.binmode
	  	temp_file.write(attachment.read)
		temp_file.rewind
		self.image = temp_file
	  ensure
	    temp_file.close
	    temp_file.unlink
	  end
	end

	def get_picture
		url = self.image.url
		Rails.logger.debug 'url is '+ url.to_s
		pic  = open(url) {|f| f.read }

		return pic
	end
end
