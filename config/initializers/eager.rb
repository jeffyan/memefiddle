#Dir["#{Rails.root}/lib/extras/*.rb"].each {|file| load file}
require File.join(Rails.root, "lib/extras/no_compression.rb")