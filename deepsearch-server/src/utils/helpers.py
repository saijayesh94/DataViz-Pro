import os
import decimal
# from jose import jwt
# from dotenv import load_dotenv

from utils.logger import CustomLogger
from datetime import datetime, timedelta

# load_dotenv()

# ALGORITHM = os.getenv("ALGORITHM")
# SECRET_KEY = os.getenv("SECRET_KEY")
# ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("TOKEN_EXPIRE_MINUTES"))

class Helpers:

    @staticmethod   # Change function parameters to understandable names
    def execute_sql_query(db_pool, db_name, llm_response, columns_metadata=None): 

        results = []
        resp_meta = {}
        query_status = True

        connection = db_pool.get_connection()
        
        try:
            with connection.cursor() as cursor:
                cursor.execute("USE {}".format(db_name))
                CustomLogger.info(f"Connected to '{db_name}' database")

                if llm_response["type"] == "query" and "sql_query" in llm_response:
                    query = llm_response["sql_query"]
                    cursor.execute(query)

                    rows = cursor.fetchall()
                    columns_data = cursor.description
                    # columns = [desc[0] for desc in cursor.description]
                    CustomLogger.info(f"Columns returned after query execution: {columns_data}")

                    if columns_metadata:
                        resp_meta = Helpers.filter_columns_metadata(columns_data, columns_metadata)

                    for row in rows:
                        # Convert the row to a dictionary and handle Decimal conversion to Decimal128
                        row_dict = {}
                        for column, value in zip([column[0] for column in columns_data], row):
                            if isinstance(value, decimal.Decimal):
                                # Convert Decimal to Decimal128 for MongoDB compatibility
                                row_dict[column] = float(value)
                            else:
                                row_dict[column] = value
                        results.append(row_dict)

                    # for row in rows:
                    #     results.append(dict(zip([column[0] for column in columns_data], row)))

                if not results:
                    CustomLogger.info("Table data Empty! No SQL result")

        except Exception:
            query_status = False
            CustomLogger.info("There might be an issue with the SQL syntax or the query is incorrect.")

        finally:
            connection.close()

        return {"query_status": query_status, "results": results, "column_data": resp_meta}

    @staticmethod
    def create_response(completion_response, sql_resp):
        # CustomLogger.info(f"completion_response: {completion_response} {type(completion_response)}")
        fin_resp = {
            "role": "assistant",
		    "type": completion_response["llm_json"]["type"],
			"content": completion_response["llm_json"]["response"],
            "query_status": sql_resp["query_status"],
            "sql_query": completion_response["llm_json"].get("sql_query", None),
            "explanation": completion_response["llm_json"].get("explanation", None),
			"table_data": sql_resp["results"],
            "chart_rec": completion_response["llm_json"].get("chart_rec", {})
        }

        return fin_resp
    
    @staticmethod
    def filter_columns_metadata(list_data, json_data):
        new_json = {}
        dataType_codes = {
            "1": "char",
            "3": "int",
            "4": "float",
            "10": "date",
            "12": "datetime",
            "246": "decimal",
            "252": "blob_string",
            "253": "varchar"   
        }

        for column_meta_data in list_data:
            if column_meta_data[0] in json_data and 'display_name' in json_data[column_meta_data[0]]:
                new_json[column_meta_data[0]] = {'display_name': json_data[column_meta_data[0]]['display_name'],
                                         'data_type': dataType_codes.get(str(column_meta_data[1]), None)}

            else:
                new_json[column_meta_data[0]] = {'display_name': column_meta_data[0], 'data_type': dataType_codes.get(str(column_meta_data[1]), None)}

        return new_json


    # @staticmethod
    # def create_jwt_token(email, org_id):
    #     token_data = {
    #         "email": email,
    #         "org_id": org_id,
    #         "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    #     }
        
    #     # Create token
    #     token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    #     return token

    # @staticmethod
    # def decode_jwt_token(token):
    #     try:
    #         decoded_token = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    #         return decoded_token
    #     except:
    #         return None

    