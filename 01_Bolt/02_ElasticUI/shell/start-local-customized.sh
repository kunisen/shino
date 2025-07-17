kunikuni@Kunis-MBP ~ % sh start-local.sh 

  ______ _           _   _      
 |  ____| |         | | (_)     
 | |__  | | __ _ ___| |_ _  ___ 
 |  __| | |/ _` / __| __| |/ __|
 | |____| | (_| \__ \ |_| | (__ 
 |______|_|\__,_|___/\__|_|\___|
-------------------------------------------------
🚀 Run Elasticsearch and Kibana for local testing
-------------------------------------------------

ℹ️  Do not use this script in a production environment

⌛️ Setting up Elasticsearch and Kibana v9.0.3-arm64...

- Generated random passwords
- Created the elastic-start-local folder containing the files:
  - .env, with settings
  - docker-compose.yml, for Docker services
  - start/stop/uninstall commands
- Running docker compose up --wait

[+] Running 6/6
 ✔ Network elastic-start-local_default             Created                                                                            0.0s 
 ✔ Volume "elastic-start-local_dev-elasticsearch"  Created                                                                            0.0s 
 ✔ Volume "elastic-start-local_dev-kibana"         Created                                                                            0.0s 
 ✔ Container es-local-dev                          Healthy                                                                           21.9s 
 ✔ Container kibana-local-settings                 Exited                                                                            21.9s 
 ✔ Container kibana-local-dev                      Healthy                                                                           31.9s 

🎉 Congrats, Elasticsearch and Kibana are installed and running in Docker!

🌐 Open your browser at http://localhost:5601

   Username: elastic
   Password: 2P6Bjfmk

🔌 Elasticsearch API endpoint: http://localhost:9200
🔑 API key: RVBBeEU1Z0IwQnpXY1lzMzNxdUg6ZTROSjluMjJreFgzSDAzUm5LN2ZRQQ==


Learn more at https://github.com/elastic/start-local

