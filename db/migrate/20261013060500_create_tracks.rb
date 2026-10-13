class CreateTracks < ActiveRecord::Migration[8.1]
  def change
    create_table :tracks do |t|
      t.string :title
      t.string :artist
      t.string :album

      t.timestamps
    end
  end
end
