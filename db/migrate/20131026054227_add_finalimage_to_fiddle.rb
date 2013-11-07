class AddFinalimageToFiddle < ActiveRecord::Migration
  def self.up
    add_attachment :fiddles, :finalimage
  end

  def self.down
    remove_attachment :fiddles, :finalimage
  end
end
