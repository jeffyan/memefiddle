class AddColumnsToFiddle < ActiveRecord::Migration
  def change
    add_column :fiddles, :json, :text
    add_column :fiddles, :revision, :integer
    add_column :fiddles, :uniquecode, :string
  end
end
