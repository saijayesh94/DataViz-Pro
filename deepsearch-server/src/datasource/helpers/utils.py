import json
from utils.logger import CustomLogger
from datasource.connectors import DataSourceConnector
from bson import ObjectId


class Utils:

    @staticmethod
    def format_conversation_data(conv_doc):
        from utils.helpers import Helpers
        from database.manager import DataBaseManager
        from process_main import ds_details

        agent_info = DataBaseManager.fetch_agent(conv_doc['agent_id'])
        
        db_params = ds_details.get(agent_info['datasource_id'])
        db_pool = DataSourceConnector.connect(db_params)
        CustomLogger.info(f"db_params :::: {db_params}")
        columns_metadata = DataBaseManager.get_columns_metedata(agent_info['datasource_id'])
        CustomLogger.info(f"db_pool :::: {db_pool}")
        formatted_data = []
        formatted_dict = {}

        for item in conv_doc.get('conversation', []):
            role = item.get('role')
            content = item.get('content')
            
            if role == 'user':
                formatted_item = item
                
            elif role == 'assistant':
                content_dict = json.loads(content.replace("\\", ""))

                sql_result = Helpers.execute_sql_query(db_pool, db_params['database'], content_dict, columns_metadata) # if content_dict.get('type') == 'query' else []  # remove if here
                formatted_dict.update(sql_result.get("column_data", {}))

                formatted_item = {
                    "role": "assistant",
                    "type": content_dict.get('type'),
                    "content": content_dict.get('response'),
                    "query_status": sql_result["query_status"],
                    "table_data": sql_result["results"],
                    "chart_rec": content_dict.get('chart_rec', {}),
                    "sql_query": content_dict.get('sql_query', None),
                    "explanation": content_dict.get('explanation', None) 
                }
                # from sqldb Update cache_data if requested
                item['cache_data'] = formatted_item
            formatted_data.append(formatted_item)

        final_formatted_data = {
            "conversation_id": str(conv_doc.get("_id", "")),
            "agent_id": conv_doc['agent_id'],
            "user_id": conv_doc["user_id"],
            "title": conv_doc.get('title', ''),
            "conversation": formatted_data,
            "column_data": formatted_dict
        }
        # from sqldb # Update the MongoDB document
        update_result = DataBaseManager._db_info["conn"]["conversation"].update_one(
             {"_id": ObjectId(conv_doc["_id"])},
             {"$set": { "conversation": conv_doc.get('conversation') }}
        )
        CustomLogger.info(f"Conversation data updated successfully for ID: {conv_doc['_id']}\n----{final_formatted_data}\n-----")
        return final_formatted_data

    # Added from gamma from sqldb 
    @staticmethod
    def sync_message_formated(conv_doc, content_dict):
            from database.manager import DataBaseManager
            from process_main import ds_details
            # from process_main import ds_mysql_credentials
            from utils.helpers import Helpers

            # Fetch database credentials and pool for the specific data source
            # db_params = ds_mysql_credentials.get(conv_doc["ds_name"]) 
            # db_pool = DataSourceConnector.connect(db_params)
            agent_info = DataBaseManager.fetch_agent(conv_doc['agent_id'])
        
            db_params = ds_details.get(agent_info['datasource_id'])
            db_pool = DataSourceConnector.connect(db_params)
            # Fetch metadata for the columns
            CustomLogger.info(f"db_params :::: {db_params}\nconv_doc :::: {conv_doc}")
            columns_metadata = DataBaseManager.get_columns_metedata(agent_info['datasource_id'])
            # Execute SQL query if type is 'query'
            CustomLogger.info(f"agent_info :::: {agent_info}")
            sql_result = Helpers.execute_sql_query(db_pool, db_params['database'], content_dict, columns_metadata)

            # Format the assistant's response
            formatted_item = {
                "role": "assistant",
                "type": content_dict.get('type'),
                "content": content_dict.get('response'),
                "query_status": sql_result["query_status"],
                "table_data": sql_result["results"],
                "chart_rec": content_dict.get('chart_rec', {}),
                "sql_query": content_dict.get('sql_query', None),
                "explanation": content_dict.get('explanation', None)
            }
            return formatted_item
