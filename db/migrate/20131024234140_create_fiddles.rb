class CreateFiddles < ActiveRecord::Migration
  def change
    create_table :fiddles do |t|

      t.timestamps
    end
  end
end
