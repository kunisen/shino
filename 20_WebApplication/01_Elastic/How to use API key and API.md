```bash
## How to use API key and API
ELASTIC_API_KEY="foobar"

## PUT doc
curl -X PUT -H "Authorization: ApiKey $ELASTIC_API_KEY" -H "Content-Type: application/json" -d '{"bible":{"summative":95,"formative":97}}' "http://localhost:9200/my_score_g7/_doc/1"

## GET doc
curl -X GET -H "Authorization: ApiKey $ELASTIC_API_KEY" -H "Content-Type: application/json" -d '{"query":{"range":{"bible.formative":{"lt":99}}}}' "http://localhost:9200/my_score_g7/_search"
```