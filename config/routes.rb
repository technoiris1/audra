
Rails.application.routes.draw do
  root "tracks#index"

  resources :tracks

  get "up" => "rails/health#show", as: :rails_health_check
end
