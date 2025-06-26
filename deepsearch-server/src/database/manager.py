import os, re
import json, copy
import pymongo
from bson import ObjectId
from dotenv import load_dotenv
from pymongo import ReturnDocument
import datetime

from utils.helpers import Helpers
from utils.logger import CustomLogger
from datasource.helpers.utils import Utils
from datasource.connectors import DataSourceConnector
from datetime import date
from bcrypt import hashpw, gensalt, checkpw

load_dotenv()

class DataBaseManager:

    db_url = os.getenv("MONGO_URL")
    db_name = os.getenv("MONGO_DB")
    _db_info = None

    @staticmethod 
    def connect_db():
        db_url = DataBaseManager.db_url
        db_name = DataBaseManager.db_name

        try:
            client = pymongo.MongoClient(db_url)
            db = client[db_name]
            if db_name not in client.list_database_names():
                client[db_name]
                CustomLogger.info(f"Database '{db_name}' created successfully.")

            CustomLogger.info(f"Connected to MongoDB database: {db_name}")

            collection_names = ['conversation', 'prompts', 'dashboards', 'datasource', 'agents', 'users', 'organizations']

            for collection_name in collection_names:
                if collection_name not in db.list_collection_names():
                    db.create_collection(collection_name)

            DataBaseManager._db_info = {"conn": db}

            return DataBaseManager._db_info
        
        except pymongo.errors.ConnectionFailure as e:
            CustomLogger.error(f"Failed to connect to MongoDB: {e}")

        except pymongo.errors.OperationFailure as e:
            CustomLogger.error(f"MongoDB operation failed: {e}")

    @staticmethod
    def conversation_exists(conv_data, agent_id):
        '''
        Checks if the conversation exists in the database.
        If found, appends the base prompt with the latest message and the existing conversation.
        If not found, appends the base prompt and the conversation.

        Args:
            conversation (obj): Object containing conversation data.

        Returns:
            dict: message_id, messages, and title.
        '''
        conversation_exists = DataBaseManager.message_exists(conv_data)
        title = conv_data.conversation[0]["content"]
        
        doc_prmp = DataBaseManager._db_info["conn"]["prompts"].find_one({"agent_id": agent_id})

        if doc_prmp:
            CustomLogger.info(f"Prompt for '{agent_id}' fetched successfully.")
            base_prompt = doc_prmp["prompt"]
        else:
            CustomLogger.info(f"Prompt for '{agent_id}' doesn't exist!")
        
        if conversation_exists["id"]:
            
            conversation_exists["conversation"].append(conv_data.conversation[-1])  # appending existing chat with last user message
            CustomLogger.info(f"conversation_exists :::: {conversation_exists['conversation']}")
            messages = base_prompt + conversation_exists["conversation"]

        else:
            messages = base_prompt + conv_data.conversation
            # CustomLogger.info(f"Message: {messages}")
        
        return {"message_id": str(conversation_exists["id"]), "title": title, "messages": messages}

    @staticmethod   
    def message_exists(conv_data):
        '''
        Checks if a message exists in the database using conversation_id.

        Args:
            conv_data (obj): Object containing conversation data.

        Returns:
            dict or None: Conversation ID and entire conversation if found, otherwise None.
        '''
        if conv_data.conversation_id:
            conv_coll = DataBaseManager._db_info["conn"]["conversation"]

            # doc = conv_coll.find_one({"_id": ObjectId(conv_data.conversation_id)})
            doc = conv_coll.find_one({"_id": ObjectId(conv_data.conversation_id)}, 
            {
                "_id": 1,
                "user_id": 1,
                "column_data": 1,
                "conversation.content": 1,
                "conversation.role": 1,
                "conversation.content": 1
            })
            if doc is not None:
                # CustomLogger.info(f"Conversation history for id '{conv_data.conversation_id}' fetched successfully!")
                return {"id": ObjectId(doc["_id"]), "conversation": doc["conversation"]}
            else:
                CustomLogger.info(f"Conversation history for id '{conv_data.conversation_id}' do not exist!")
              
        else:
            CustomLogger.info("A new conversation started!")
            return {"id": None}
            
    @staticmethod
    # def store_conversation(llm_response, conv_data,  response, column_data_final): # from sqldb
    def store_conversation(llm_response, conv_data,  response, column_data_final): 
        '''
        Storing users last message and its corresponding llm response.
        '''
        try:
            conv_coll = DataBaseManager._db_info["conn"]["conversation"]
            llm_response["chat_data"]["cache_data"]=response # from sqldb
            # Convert only date fields to strings while leaving other types unchanged
            column_data_final = {k: (str(v) if isinstance(v, date) else v) for k, v in column_data_final.items()}
            if llm_response.get("id") != "None": 
                conv_coll.update_one(
                {"_id": ObjectId(llm_response["id"]), "user_id": conv_data.user_id},
                {
                    '$push': {"conversation": {"$each": [conv_data.conversation[-1], llm_response["chat_data"]]}},
                    '$set': {"agent_id": conv_data.agent_id},
                    '$set': {"column_data": column_data_final}
                },)
                # {'$push': {"conversation": {"$each": [conv_data.conversation[-1], llm_response["chat_data"]]}}
                #  '$set': {"db_name": db_name}})

                # CustomLogger.info(f"Conversation updated successfully for id {str(llm_response['id'])}")
                return str(llm_response["id"])
                
            else:
                conversation = {"user_id": conv_data.user_id, "column_data":column_data_final,"agent_id": conv_data.agent_id, "title": conv_data.conversation[0]["content"], "conversation": [conv_data.conversation[-1], llm_response["chat_data"]]}
                # conversation = {"title": conv_data.conversation[0]["content"], "conversation": [conv_data.conversation[-1], llm_response["chat_data"]]}
                res = conv_coll.insert_one(conversation)
                # CustomLogger.info(f"Conversation inserted successfully for id {str(res.inserted_id)}")
                return str(res.inserted_id)

        except Exception as e:
            CustomLogger.exception(f"Error in store_conversation {str(e)}")
            return {"status": "fail", "message": f"Error in store_conversation {str(e)}", "resp_obj": ""}

# from sqldb refer this when adding cache_data to store_conversation            
    # @staticmethod
    # def store_conversation(llm_response, conv_data,  response, column_data_final):
    #     '''
    #     Storing users last message and its corresponding llm response.
    #     '''
    #     try:
    #         conv_coll = DataBaseManager._db_info["conn"]["conversation"]
    #         llm_response["chat_data"]["cache_data"]=response
    #         CustomLogger.info(f"cache_data :::: {response}")
    #         if llm_response.get("id") != "None": 
    #             conv_coll.update_one(
    #             {"_id": ObjectId(llm_response["id"]), "user_id": conv_data.user_id},
    #             {
    #                 '$push': {"conversation": {"$each": [conv_data.conversation[-1], llm_response["chat_data"]]}},
    #                 '$set': {"ds_name": conv_data.ds_name, "column_data": column_data_final},  # Add this line
    #                 # '$set': {"column_data": column_data_final}
    #             },)
    #             CustomLogger.info(f"llm_response : {str(llm_response['chat_data'])}")
    #             CustomLogger.info(f"store in mongoDB (response, column_data_final): {response, column_data_final}")
    #             # {'$push': {"conversation": {"$each": [conv_data.conversation[-1], llm_response["chat_data"]]}}
    #             #  '$set': {"db_name": db_name}})
                
    #             CustomLogger.info(f"Conversation updated successfully for id {str(llm_response['id'])}")
    #             return llm_response["id"]
                
    #         else:
    #             conversation = {"user_id": conv_data.user_id, "column_data":column_data_final, "ds_name": conv_data.ds_name, "title": conv_data.conversation[0]["content"], "conversation": [conv_data.conversation[-1], llm_response["chat_data"]]}
    #             # conversation = {"title": conv_data.conversation[0]["content"], "conversation": [conv_data.conversation[-1], llm_response["chat_data"]]}
    #             res = conv_coll.insert_one(conversation)
    #             CustomLogger.info(f"Conversation inserted successfully for id {str(res.inserted_id)}")
    #             return str(res.inserted_id)

    #     except Exception as e:
    #         CustomLogger.exception(f"Error in store_conversation {str(e)}")
    #         return {"status": "fail", "message": f"Error in store_conversation {str(e)}", "resp_obj": ""}


    @staticmethod
    def get_conversations(_id): 
        if not _id.conversation_id:  # Without ID
            all_conv = DataBaseManager._db_info["conn"]["conversation"].find({"user_id": _id.user_id}, {"title": 1})
            formatted_conv = [{"user_id": _id.user_id, "title": conv["title"], "_id": str(conv["_id"])} for conv in all_conv]
    
            if len(formatted_conv) > 0:
                CustomLogger.info("Conversations fetched successfully!")
                return {"status": "success", "message": "Conversations fetched successfully!", "resp_obj": formatted_conv}
            
            else:
                CustomLogger.info("Conversations doesn't exist!")
                return {"status": "success", "message": "Conversations doesn't exist!", "resp_obj": []}

        else:
            from process_main import ds_details
            conv_doc = DataBaseManager._db_info["conn"]["conversation"].find_one({"user_id": _id.user_id, "_id": ObjectId(_id.conversation_id)})
            # conv_doc = DataBaseManager._db_info["conn"]["conversation"].find_one({"user_id": _id.user_id, "_id": ObjectId(_id.conversation_id)},{"conversation": {"$slice": -20}})
            if conv_doc is not None:
                if (_id.cache_data==False):
                    final_formatted_data = Utils.format_conversation_data(conv_doc)
                    return {"status": "success", "message": f"Conversations synced successfully for id: {str(_id.conversation_id)}!", "resp_obj": final_formatted_data}
                # CustomLogger.info(f"conv_doc :::: {conv_doc}")
                
                formatted_conv = {"user_id": conv_doc["user_id"], "column_data":conv_doc["column_data"], "agent_id":conv_doc['agent_id'], "title":conv_doc["title"], "conversation":conv_doc["conversation"], "_id": str(conv_doc["_id"])}
                return {"status": "success", "message": f"Conversation fetched successfully for id: {str(_id.conversation_id)}!", "resp_obj": formatted_conv}

            else:
                CustomLogger.info(f"Conversations for Id: {str(_id.conversation_id)} do not exist!")
                return {"status": "success", "message": f"Conversations for Id: {str(_id.conversation_id)} do not exist!", "resp_obj": ""}

# from sqldb
    @staticmethod
    def sync_message(_id: 'SyncMessage'):
        try:
            # Find the conversation document by user_id and convo_id
            conv_doc = DataBaseManager._db_info["conn"]["conversation"].find_one({
                "user_id": _id.user_id,
                "_id": ObjectId(_id.convo_id)
            })

            if not conv_doc:
                raise ValueError("Conversation not found")

            conversation_array = conv_doc.get("conversation", [])
            content = conversation_array[_id.convo_index].get("content")

            content_dict = json.loads(content.replace("\\", ""))
            cache_data=Utils.sync_message_formated(conv_doc, content_dict)
            conversation_array[_id.convo_index]["cache_data"]=cache_data

            update_result = DataBaseManager._db_info["conn"]["conversation"].update_one(
                {"_id": ObjectId(_id.convo_id)},
                {"$set": {"conversation": conversation_array}}
                # "$set": {
                #   f"conversation.{_id.convo_index}.cache_data": cache_data
                # }
            )
            # CustomLogger.info(f"Cache data updated successfully in mongodb for conversation ID: {_id.convo_id}")
            return {"status": "success", "message": "Cache data updated", "resp_obj": cache_data}

        except Exception as e:
            CustomLogger.exception(f"Error occurred while syncing message: {str(e)}")
            return {"status": "fail", "message": "Error occurred while syncing message", "resp_obj": ""}

    @staticmethod
    def update_datasource_schema(ds_req):
        '''
        Update or insert the schema description of a datasource in MongoDB.

        Args:
            ds_req (object): An object that contains 'ds_name' and 'schema_description'.
        '''
        # DataBaseManager._db_info["conn"]["datasource"].update_one(
        #     {"ds_name": ds_req.ds_name},
        #     {"$set": {"schema_description": ds_req.schema_description}},
        #     upsert=True)

        # from sqldb
        DataBaseManager._db_info["conn"]["datasource"].update_one(
            {"_id": ObjectId(ds_req.datasource_id)},
            {"$set": {"schema_description": ds_req.schema_description}},
            upsert=True)
        CustomLogger.info(f"Datasource schema inserted/updated successfully for: {ds_req.datasource_id}")

    @staticmethod
    def create_text_source_index(ds_req, ds_details):
        '''
        Create a text index on a specified collection in MongoDB.

        Args:
            ds_req (object): An object that contains 'ds_name' and 'index_name'.
        '''
        CustomLogger.info("HERE")
        ds_name = ds_details.get(ds_req.datasource_id, {}).get('datsource')

        collection = DataBaseManager._db_info["conn"][ds_name]

        existing_indexes = collection.index_information()

        if ds_req.index_name in existing_indexes:
            collection.drop_index(ds_req.index_name)
        
        collection.create_index([("$**", "text")], # The index is created on all fields ("$**") with text indexing.
                                    name=ds_req.index_name  # Ref Link: https://stackoverflow.com/questions/33541290/how-can-i-create-an-index-with-pymongo
                                )


    @staticmethod
    def modify_text_source(ins_ts, ds_name):
        if ins_ts.action == "insert":
            res = DataBaseManager._db_info["conn"][ds_name].insert_one(
                {"content": ins_ts.content}
            )

            return {"_id": str(res.inserted_id), "content": ins_ts.content}
            
        elif ins_ts.action == "edit":
            DataBaseManager._db_info["conn"][ds_name].update_one(
                {"_id": ObjectId(ins_ts.document_id)},
                {"$set": {"content": ins_ts.content}}
            )

            return {"_id": ins_ts.document_id, "content": ins_ts.content}
            
        elif ins_ts.action == "delete":
            DataBaseManager._db_info["conn"][ds_name].delete_one(
                {"_id": ObjectId(ins_ts.document_id)}
            )

    @staticmethod
    def find_schema(gen_prmpt):
        agent_info = DataBaseManager.fetch_agent(gen_prmpt.agent_id)

        result = DataBaseManager._db_info["conn"]["datasource"].find_one({"_id": ObjectId(agent_info['datasource_id'])})

        if result:
            CustomLogger.info(f"Datasource schema found for: {agent_info['name']}")
            return result
        else:
            CustomLogger.info(f"Datasource schema not found for: {agent_info['name']}")

    @staticmethod
    def update_prompt(gen_prmpt, prompt, org_prompt):
        result = DataBaseManager._db_info["conn"]["prompts"].find_one_and_update(
            {"agent_id": gen_prmpt.agent_id},
            {"$set": {"base_prompt": org_prompt, "prompt": prompt}},
            upsert=True,
            return_document=ReturnDocument.AFTER,
            projection={"agent_id": 1, "prompt": 1, "_id": 0})
        CustomLogger.info("Prompt updated successfully!")

        return result
    
    @staticmethod
    def fetch_mysql_datasource(ds_req):
        '''
        Fetch the schema description of a MySQL datasource from MongoDB.

        Args:
            ds_req (object): An object that contains the datasource name in the attribute 'ds_name'.

        Returns:
            dict: A dictionary with the datasource name and its schema description.
        '''
        result = DataBaseManager._db_info["conn"]["datasource"].find_one(
                {"_id": ObjectId(ds_req.datasource_id)},
                {"schema_description": 1}
            )
        # from sqldb
        if result:
            CustomLogger.info(f"Mysql schema details fetched from mongoDB for: {ds_req.datasource_id}")
            return {"datasource_id": ds_req.datasource_id, "schema_description": result["schema_description"]}
        
    @staticmethod
    def fetch_text_datasource(ds_req, ds_details):
        '''
        Fetch all documents from MongoDB.
        Args:
            ds_req (object): An object that contains the datasource name in the attribute 'ds_name'.

        Returns:
            dict: A dictionary with the datasource name and all documents from the collection.
        '''


        ds_name = ds_details.get(ds_req.datasource_id, {}).get('datsource')

        documents = DataBaseManager._db_info["conn"][ds_name].find({}, {"mappingType": 0})
        all_documents = list(documents)

        for doc in all_documents:
            if "_id" in doc:
                doc["_id"] = str(doc["_id"])

        return {"ds_name": ds_name, "all_documents": all_documents}
            
    @staticmethod
    def get_columns_metedata(datasource_id):
        collection = DataBaseManager._db_info["conn"]["datasource"]
    
        pipeline = [
            {"$match": {"_id": ObjectId(datasource_id)}},
            {"$unwind": "$schema_description.tables"},
            {"$replaceRoot": {"newRoot": "$schema_description.tables"}},
            {"$unwind": "$columns"},
            {"$project": {
                "column_name": "$columns.column_name",
                "data_type": "$columns.data_type",
                "display_name": "$columns.display_name",
                "description": "$columns.description",
                "enable": {"$toBool": "$columns.enable"}
            }}
        ]
    
        cursor = collection.aggregate(pipeline)
    
        schema_data = {}
        for column_data in cursor:
            col_name = column_data['column_name']
            if col_name not in schema_data:
                schema_data[col_name] = {
                    "data_type": column_data['data_type'],
                    "display_name": column_data['display_name'],
                    "description": column_data['description'],
                    "enable": column_data['enable']
                }
    
        return schema_data
    
    @staticmethod
    def del_chat(del_chat):
        conv_coll = DataBaseManager._db_info["conn"]["conversation"]
        conv_coll.delete_one({"_id": ObjectId(del_chat.conversation_id)})
    
    @staticmethod
    def update_title(update_details):
        conv_coll = DataBaseManager._db_info["conn"]["conversation"]

        conv_coll.update_one(
        {"_id": ObjectId(update_details.conversation_id)},
        {"$set": {"title": update_details.title}}
        )

    @staticmethod
    def create_dash_grps(dash_grps):
        if dash_grps.dashboard_id is None:
            dash_obj = {"user_id": dash_grps.user_id, "name": dash_grps.dashboard_name, "last_sync":"", "sync_frequency":"10800", "groups": []}
            res = DataBaseManager._db_info["conn"]["dashboards"].insert_one(dash_obj)  # Insert a new dashboard

            # Fetch all dashboards from the database
            formatted_dashboards = DataBaseManager.fetch_all_dashboards(dash_grps)

            return {"status": "success", "message": f"Dashboard inserted successfully for id {str(res.inserted_id)}", "resp_obj": formatted_dashboards if formatted_dashboards is not None else ""}

        elif dash_grps.dashboard_id:  # Check if dashboard_id is not None
            # Update an existing dashboard
            updated_dashboard = DataBaseManager._db_info["conn"]["dashboards"].find_one_and_update(
                {"_id": ObjectId(dash_grps.dashboard_id)},
                {"$addToSet": {"groups": {"$each": [
                    {"_id": str(ObjectId()), "group_name": dash_grps.group_name, "items": []}]
                }}},
                # return_document=pymongo.ReturnDocument.AFTER  # retrieve the document after the update operation
            )

            # resp_obj = {
            #     "_id": str(updated_dashboard["_id"]),
            #     "name": updated_dashboard["name"],
            #     "groups": [{"_id": group["_id"], "name": group["group_name"]} for group in updated_dashboard["groups"]]
            # }
            formatted_dashboards = DataBaseManager.fetch_all_dashboards(dash_grps)

            return {"status": "success", "message": f"Groups inserted successfully for id {dash_grps.dashboard_id}", "resp_obj": formatted_dashboards}

    @staticmethod
    def save_dashboards(save_dash):
        sql_query, agent_id = DataBaseManager.fetch_sql_query(save_dash) 

        update_query = {
            "$push": {
                "groups.$.items": {
                    "_id": str(ObjectId()),  # Generating items Id
                    "agent_id": agent_id,
                    "description": save_dash.item_title,
                    "sql_query": sql_query,
                    "columns_data": save_dash.column_data,
                    "chart_rec": save_dash.chart_rec,
                    "custom_style": str(save_dash.custom_style)
                }
            }
        }

        DataBaseManager._db_info["conn"]["dashboards"].update_one(
            {"_id": ObjectId(save_dash.dashboard_id),
            "user_id": save_dash.user_id,
            "groups._id": save_dash.group_id},
            update_query
        )

    @staticmethod
    def fetch_all_dashboards(fetch_dash):
        all_dashboards = DataBaseManager._db_info["conn"]["dashboards"].find({"user_id": fetch_dash.user_id}) 

        formatted_dashboard = [{
            "_id": str(dashboard["_id"]),
            "name": dashboard["name"],
            "groups": [{"_id": group["_id"], "name": group["group_name"]} for group in dashboard["groups"] if "group_name" in group]
        } for dashboard in all_dashboards]

        return formatted_dashboard

    @staticmethod
    def fetch_single_dashboard(fetch_dash):
        cache_data=fetch_dash.cache_data # from sqldb 
        from process_main import ds_details
        dashboard = DataBaseManager._db_info["conn"]["dashboards"].find_one({"_id": ObjectId(fetch_dash.dashboard_id), "user_id": fetch_dash.user_id})
        # from sqldb for cache_data
        if cache_data==False:

            if dashboard:
                dashboard["_id"] = str(dashboard["_id"])
                for group in dashboard.get("groups", []):
                    items = group.get("items", [])
                    for item in items:
                        agent_info = DataBaseManager.fetch_agent(item['agent_id'])
                        db_params = ds_details.get(agent_info['datasource_id'])
                        db_pool = DataSourceConnector.connect(db_params)
                        table_data = Helpers.execute_sql_query(db_pool, db_params["database"], item["sql_query"])
                        item["table_data"] = table_data["results"]
                    # from sqldb for table_data 
                    update_data = {"$set": {"groups":dashboard["groups"],"last_sync":datetime.datetime.now(CustomLogger.ist).strftime('%Y-%m-%d %H:%M:%S'),"sync_frequency":"40"}}
                    update_log=DataBaseManager._db_info["conn"]["dashboards"].update_one(
                        {"user_id": dashboard["user_id"], "_id": ObjectId(dashboard["_id"])},update_data
                    )
            return dashboard
        # from sqldb for cache_data
        else:
            if dashboard:
                dash_dict={
                    "_id":str(dashboard["_id"]),
                    "user_id":dashboard["user_id"],
                    "name":dashboard["name"],
                    "last_sync":dashboard["last_sync"],
                    "sync_frequency":dashboard["sync_frequency"],
                    "groups":dashboard["groups"]
                }
            return dash_dict

    @staticmethod
    def fetch_sql_query(save_dash):
        conv_doc = DataBaseManager._db_info["conn"]["conversation"].find_one({"_id": ObjectId(save_dash.conversation_id)})
        conversation_item = conv_doc['conversation'][int(save_dash.conversation_index)]
        sql_val = json.loads(conversation_item['content'])['sql_query']
        return {"type": "query", "sql_query": sql_val}, conv_doc["agent_id"]

    @staticmethod
    def update_dashboards(update_dash):

        if update_dash.dashboard_name:
            update_data = {"$set": {"name": update_dash.dashboard_name}}

        if update_dash.groups is not None:
            update_data = {"$set": {"groups": update_dash.groups}}
    
        DataBaseManager._db_info["conn"]["dashboards"].update_one(
            {"user_id": update_dash.user_id, "_id": ObjectId(update_dash.dashboard_id)},
            update_data,
        )

    @staticmethod
    def delete_dashboards(del_dash):
        DataBaseManager._db_info["conn"]["dashboards"].delete_one({"user_id": del_dash.user_id,
                                                                   "_id": ObjectId(del_dash.dashboard_id)})

        resp = DataBaseManager.fetch_all_dashboards(del_dash)
        return resp
    
    @staticmethod
    def insert_mysql_datasource(ins_ds, schema_desp, ds_details):
        '''
        Inserts a MySQL datasource into the MongoDB datasource collection.
    
        Parameters:
        ins_ds (object): An instance of a class that contains necessary details of the datasource like
                        ds_name, display_name, credentials, etc.
        schema_desp (dict): The table and columns details of the MySQL database that we insert.

        '''
        dump = {
            "type": "mysql",
            "ds_name": ins_ds.ds_name, 
            "name": ins_ds.display_name,
            "credentials": {
                "username": ins_ds.credentials.username,
                "password": ins_ds.credentials.password,
                "host": ins_ds.credentials.host,
                "port": ins_ds.credentials.port
                },
            "schema_description": schema_desp["schema_description"]
        }
            
        resp = DataBaseManager._db_info["conn"]["datasource"].insert_one(dump)
        CustomLogger.info(f"Datasource schema inserted successfully for: {ins_ds.ds_name}")

        ds_details[str(resp.inserted_id)] = {   # Updating newly inserted datasource to the global variable
            "type": "mysql",
            "username": ins_ds.credentials.username,
            "password": ins_ds.credentials.password,
            "host": ins_ds.credentials.host,
            "port": ins_ds.credentials.port,
            "database": ins_ds.ds_name
        }

        return {
            "_id": str(resp.inserted_id),
            "ds_name": ins_ds.ds_name,
            "name": ins_ds.display_name,
        }

    @staticmethod
    def insert_text_source(ins_ds, ds_details):
        '''
        Inserts a text datasource into the MongoDB datasource collection.
    
        Parameters:
        ins_ds (object): An instance of a class that contains necessary details of the datasource like
                        ds_name and display_name.
        '''
        resp = DataBaseManager._db_info["conn"]["datasource"].insert_one(
            {
                "type": "text_source",
                "ds_name": ins_ds.ds_name,
                "name": ins_ds.display_name
            }
        )
        if(str(resp.inserted_id)!=""):
            ds_details[str(resp.inserted_id)] = {   # Updating newly inserted datasource to the global variable
                "type": "text_source",
                "datsource": ins_ds.ds_name
            }
        # CustomLogger.info(f"ds_details after update: {ds_details}")
        CustomLogger.info(f"Datasource schema inserted successfully for: {ins_ds.ds_name}")
        return {
            "_id": str(resp.inserted_id),
            "ds_name": ins_ds.ds_name,
            "name": ins_ds.display_name,
        }

    @staticmethod
    def get_datasources():
        '''
        Retrieves all datasources from the MongoDB 'datasource' collection.

        Returns:
        dict: A dictionary containing a list of all datasources with their details.
        '''
        db_names = []
        ds = DataBaseManager._db_info["conn"]["datasource"].find()

        for document in ds:
            db_info = {
                "_id": str(document["_id"]),
                "type": document["type"],
                "ds_name": document["ds_name"],
                "name": document.get("name", "Default")
            }
            db_names.append(db_info) 
            CustomLogger.info(f"Datasources: {db_names}")

        return {"datasources": db_names}

    @staticmethod
    def find_prompt(gen_prmpt):
        prompt = DataBaseManager._db_info["conn"]["prompts"].find_one({"agent_id": gen_prmpt.agent_id})
        return {
            "agent_id": gen_prmpt.agent_id, 
            "prompt": [prompt["base_prompt"]] + prompt["prompt"][1:]
        }

    @staticmethod
    def save_to_prompt(savePmt):
        saved_few_shots = []
        conv = DataBaseManager._db_info["conn"]["conversation"].find_one({"_id": ObjectId(savePmt.conversation_id)})
        
        for index in savePmt.conversation_index:
            conversation_item = conv['conversation'][index]
            # from sqldb for cache_data Remove the 'cache_data' field if it exists
            if 'cache_data' in conversation_item:
                del conversation_item['cache_data']

            saved_few_shots.append(conversation_item)

        DataBaseManager._db_info["conn"]["prompts"].update_one(
            {"agent_id": savePmt.agent_id},
            {'$push': {"prompt": {"$each": saved_few_shots}}})

    @staticmethod
    def ds_details():
        '''
        Retrieves datasource details from the MongoDB datasource collection.

        Returns:
        dict: A dictionary where the keys are datasource IDs and the values are dictionaries containing
            type, credentials (if available), and database name.
        '''

        filter = {"type": {"$in": ["mysql", "text_source"]}}  # Remove this 
        projection = {"_id": 1, "ds_name": 1, "type": 1, "credentials": 1}
        conv = DataBaseManager._db_info["conn"]["datasource"].find(filter, projection)

        result_dict = {}
        for doc in conv:
            _id = str(doc.get("_id"))
            db_name = doc.get("ds_name")
            type = doc.get("type")
            credentials = doc.get("credentials", None)

            if credentials:
                result_dict[_id] = {"type": type, **credentials}
                result_dict[_id]["database"] = db_name
            else:
                result_dict[_id] = {"type": type, "datsource": db_name}

        CustomLogger.info(f"Datasource Details: {result_dict}")
        return result_dict

    @staticmethod
    def create_text_source_collection(collection_name):
        '''
        Creates a new collection for the text source in the MongoDB database.
    
        Parameters:
        collection_name (str): The name of the collection to be created.
    
        Returns:
        Return False if the collection already exists 
        '''
        try:
            db = DataBaseManager._db_info['conn']

            # Check if the collection already exists
            if collection_name not in db.list_collection_names():
                db.create_collection(collection_name)
                CustomLogger.info(f"Collection: {collection_name} created Successfully")
                return True
            
            else:
                # Return False if the collection already exists
                CustomLogger.info(f"Failed to Create Collection as {collection_name} already exists")
                return False
            
        except Exception as e:
            CustomLogger.info(f"Failed to Create Collection for {collection_name}")
            return False

    @staticmethod
    def similarity_search(ds_details, rag_datasources, question):
        '''
        Performs a similarity search across specified datasources and formats the results.

        Args:
        ds_details (dict): Dictionary containing details of datasources.
        rag_datasources (list): List of datasource IDs to search.
        question (str): The query to search for.

        Returns:
        str: A formatted string containing the search results or the original question if no results are found.
        '''
        similarity = os.getenv("SIMILARITY_SEARCH")
        search_results = []
        rag_data = []
        # Iterate over each rag datasource IDs and perform search based on type.
        for ds_id in rag_datasources:
            ds_info = ds_details.get(ds_id)

            if ds_info and ds_info.get("type") == "text_source": # Try to fetch without Id 
                collection = ds_info.get('datsource')
                
                if similarity=="True":
                    search_result = DataBaseManager._db_info['conn'][collection].find({"$text": {"$search": question}})
                else:
                    search_result = DataBaseManager._db_info['conn'][collection].find({})
                
                rag_data_db=copy.deepcopy(search_result)
                rag_data = [document.get('content', '') for document in rag_data_db]

                results = [document.get('content', '') for document in search_result]
                if results:
                    formatted_results = f'<{collection}>: [{", ".join(results)}]</{collection}>'
                    search_results.append(formatted_results)

        final_output = f'{question}. "{", ".join(search_results)}"' if search_results else question
        # CustomLogger.info(f"Similarity search result: {final_output}")
        return final_output, rag_data

    @staticmethod
    def fetch_agent(agent_id):
        '''
        Fetches the agent details from the MongoDB based on the provided agent ID.

        Args:
        agent_id (str): The unique identifier of the agent to fetch

        Returns:
        dict: A dictionary containing the agent's name, type, datasource_id, and rag_datasources,
            or None if the agent is not found.
        '''
        docu = DataBaseManager._db_info["conn"]["agents"].find_one(
            {"_id": ObjectId(agent_id)})

        if docu:
            CustomLogger.info(f"'{docu['name']}' which is of type '{docu['type']}' fetched successfully.")

            agent_info = {
                "name": docu['name'],
                "type": docu['type'],
                "datasource_id": docu['datasource_id'],
                "rag_datasources": docu["rag_datasources"]
            }
        
            CustomLogger.info(f"{docu['name']} details: {agent_info}")
            return agent_info

    # @staticmethod
    # def get_agents(agent_id):
    #     docs = DataBaseManager._db_info["conn"]["agents"].find_one()
    #     agents=[]
    #     if docs:
    #         CustomLogger.info(f"'{docu['name']}' which is of type '{docu['type']}' fetched successfully.")
            
    #         for doc in docs:
    #             agent_info = {
    #                 "_id": doc['id'],
    #                 "name": doc['name'],
    #                 "type": doc['type'],
    #                 "datasource_id": doc['datasource_id'],
    #                 "rag_datasources": doc["rag_datasources"]
    #             }
    #             agents.append(doc)
    #         CustomLogger.info(f"agents fetched: {agents}")
    #         return agents
    @staticmethod
    def get_agents(agent_id=None):
        docs = DataBaseManager._db_info["conn"]["agents"].find()
        agent_list={}
        agents = []

        if docs:
            for doc in docs:
                agent_info = {
                    "_id": str(doc['_id']),
                    "name": doc['name'],
                    "type": doc['type'],
                    "datasource_id": doc['datasource_id'],
                    "rag_datasources": doc.get("rag_datasources")  # use .get() in case the key is missing
                }
                agents.append(agent_info)
                CustomLogger.info(f"'{doc['name']}' which is of type '{doc['type']}' fetched successfully.")

            CustomLogger.info(f"Agents fetched: {agents}")
        agent_list={"agents":agents}
        return agent_list


    @staticmethod
    def insert_agent(agent_data):
        try:
            # Log the incoming data
            CustomLogger.info(f"agent_data :::: {agent_data}")
            
            # Construct the document to insert using dot notation
            agent_doc = {
                "name": agent_data.name,
                "type": agent_data.type,
                "rag_datasources": [str(ds_id) for ds_id in agent_data.rag_datasources],
                "datasource_id": str(agent_data.datasource_id)
            }

            # Insert the document into the agents collection
            resp = DataBaseManager._db_info["conn"]["agents"].insert_one(agent_doc)
            
            # Log the success
            CustomLogger.info(f"Agent '{agent_data.name}' of type '{agent_data.type}' inserted successfully with ID: {resp.inserted_id}")
            
            return str(resp.inserted_id)  # Return the ID of the inserted document
        except Exception as e:
            # Log the error
            CustomLogger.info(f"Failed to insert agent: {str(e)}")
            return None

    @staticmethod
    def update_agent(agent_data):
        try:
            # Log the incoming data
            CustomLogger.info(f"agent_data to update :::: {agent_data}")

            # Construct the update document
            update_doc = {
                "$set": {
                    "name": agent_data.name,
                    "type": agent_data.type,
                    "rag_datasources": [str(ds_id) for ds_id in agent_data.rag_datasources],
                    "datasource_id": str(agent_data.datasource_id)
                }
            }

            # Ensure agent_id is provided
            if not agent_data.agent_id:
                CustomLogger.info(f"agent_id is required for update")

            # Update the document in the agents collection
            result = DataBaseManager._db_info["conn"]["agents"].update_one(
                {"_id": ObjectId(agent_data.agent_id)},
                update_doc
            )
            CustomLogger.info(f"result :::: {result}")
            # Log the success
            CustomLogger.info(f"Agent '{agent_data.name}' of type '{agent_data.type}' updated successfully.")
            return {"status": "success", "message": "Agent updated successfully!", "resp_obj": ""}
        except Exception as e:
            # Log the error
            CustomLogger.exception(f"Failed to update agent: {str(e)}")
            return {"status": "fail", "message": f"Failed to update agent: {str(e)}", "resp_obj": ""}

    def verify_password(entered_password: str, stored_hashed_password: str) -> bool:
        try:
            # Compare the entered password with the stored hashed password
            return checkpw(entered_password.encode('utf-8'), stored_hashed_password.encode('utf-8'))
        except Exception as e:
            CustomLogger.exception(f"Error during password verification: {str(e)}")
            return False

    @staticmethod
    def verify_user(user_data):
        docu = DataBaseManager._db_info["conn"]["users"].find_one(
            {"mailid": user_data.username})
        CustomLogger.info(f"verify_login_doc: {docu}")
        return checkpw(user_data.password.encode('utf-8'), docu['password'].encode('utf-8')), docu['type'], docu['accessList'], docu['orgId']

    @staticmethod
    def insert_user(user_data):
        try:
            CustomLogger.info(f"user_data :::: {user_data}")
            docu = DataBaseManager._db_info["conn"]["users"].find_one(
                {"mailid": user_data.inserted_by_mailid})
            if docu['mailid']:
                hashed_password = hashpw(user_data.password.encode('utf-8'), gensalt()).decode('utf-8')
                user_doc = {
                    "name": user_data.name,
                    "mailid": user_data.mailid,
                    "type": user_data.type,
                    "password": hashed_password,
                    "accessList":user_data.accessList,
                    "orgId":docu['orgId']
                }
                resp = DataBaseManager._db_info["conn"]["users"].insert_one(user_doc)
                CustomLogger.info(f"User '{user_data.name}' of type '{user_data.type}' inserted successfully with ID: {resp.inserted_id}")
                return {"status": "success", "message": "User inserted successfully!", "resp_obj": ""}
            else:
                return {"status": "fail", "message":"Not Authorized", "resp_obj": ""}
        except Exception as e:
            CustomLogger.exception(f"Failed to insert user: {str(e)}")
            return None

    @staticmethod
    def signup_user(user_data):
        try:
            hashed_password = hashpw(user_data.password.encode('utf-8'), gensalt()).decode('utf-8')
            insert_org_doc=DataBaseManager._db_info["conn"]["organizations"].insert_one({"orgName":user_data.orgName})
            CustomLogger.info(f"insert_org_doc ::: {insert_org_doc}")
            user_doc = {
                "name": user_data.name,
                "mailid": user_data.mailid,
                "type": "admin",
                "password": hashed_password,
                "accessList":[],
                "orgName":user_data.orgName,
                "orgId":str(ObjectId(insert_org_doc.inserted_id))
            }
            resp = DataBaseManager._db_info["conn"]["users"].insert_one(user_doc)
            CustomLogger.info(f"User '{user_data.name}' of type '{user_data.type}' signup successful with ID: {resp.inserted_id}")
            return resp.inserted_id
        except Exception as e:
            CustomLogger.exception(f"Failed to insert user: {str(e)}")
            return None

    # @staticmethod
    # def update_user(user_data):
    #     try:
    #         CustomLogger.info(f"Attempting to update user: {user_data}")
    #         if user_data.user_id:
    #             hashed_password = hashpw(user_data.password.encode('utf-8'), gensalt()).decode('utf-8')
    #             update_doc = {
    #                 "$set": {
    #                     "name": user_data.name,
    #                     # "mailid":user_data.mailid,
    #                     "type": user_data.type,
    #                     "password": hashed_password,
    #                     "accessList": user_data.accessList
    #                 }
    #             }
    #             result = DataBaseManager._db_info["conn"]["users"].update_one(
    #                 {"_id": ObjectId(user_data.user_id)},
    #                 update_doc
    #             )
    #             if result.matched_count > 0:
    #                 return {"status": "success", "message": "User updated successfully!", "resp_obj": ""}
    #             else:
    #                 return {"status": "fail", "message": "No user found to update", "resp_obj": ""}
    #         else:
    #             return {"status": "fail", "message": "user_id missing.", "resp_obj": ""}

    #     except Exception as e:
    #         CustomLogger.exception(f"Failed to update user: {str(e)}")
    #         return {"status": "fail", "message": "Failed to update user", "resp_obj": ""}


    @staticmethod
    def get_users(user_data):
        try:
            docu = DataBaseManager._db_info["conn"]["users"].find_one(
                {"mailid": user_data.mailid})
            # docs = DataBaseManager._db_info["conn"]["users"].find()
            docs = DataBaseManager._db_info["conn"]["users"].find({"orgId": docu['orgId']})
            user_list = {}
            users = []
            if docs:
                for doc in docs:
                    user_info = {
                        "_id": str(doc['_id']),
                        "name": doc['name'],
                        "type": doc['type'],
                        "mailid": doc['mailid'],
                        "accessList":doc['accessList']
                    }
                    users.append(user_info)
                    CustomLogger.info(f"'{doc['name']}' which is of type '{doc['type']}' fetched successfully.")
                CustomLogger.info(f"Users fetched: {users}")
                user_list = {"users": users}
                return {"status": "success", "message": "Users fetched successfully", "resp_obj": user_list}
            else:
                return {"status": "fail", "message": "Could not fetch users", "resp_obj": ""}
        except Exception as e:
            CustomLogger.exception(f"Error while fetching users: {str(e)}")
            return {"status": "fail", "message": "Could not fetch users", "resp_obj": ""}

    @staticmethod
    def delete_user(user_data):
        try:
            if not user_data.user_id:
                return {"status": "fail", "message": "user_id is required for deletion.", "resp_obj": ""}
            
            _id = user_data.user_id
            CustomLogger.info(f"Attempting to delete user with ID: {_id}")
            
            user_doc = DataBaseManager._db_info["conn"]["users"].find_one({"_id": ObjectId(_id)})
            if not user_doc:
                return {"status": "fail", "message": "User not found.", "resp_obj": ""}
    
            user_delete_result = DataBaseManager._db_info["conn"]["users"].delete_one({"_id": ObjectId(_id)})
    
            if user_delete_result.deleted_count > 0:
                CustomLogger.info(f"User with ID '{_id}' deleted successfully.")
                return {"status": "success", "message": "User deleted successfully!", "resp_obj": ""}
            else:
                return {"status": "fail", "message": "Failed to delete user.", "resp_obj": ""}
    
        except Exception as e:
            CustomLogger.exception(f"Failed to delete user: {str(e)}")
            return {"status": "fail", "message": f"Failed to delete user: {str(e)}", "resp_obj": ""}

    # @staticmethod
    # def get_kpi_details(agent_id):
    #     from process_main import ds_details
    #     try:
    #         agent_info = DataBaseManager.fetch_agent(agent_id)
    #         query = "SELECT id, name, unitOfMeasurement FROM cl_iba.IBA_KeyPerformanceIndicator;"
    #         db_params = ds_details.get(agent_info['datasource_id'])
    #         db_pool = DataSourceConnector.connect(db_params)
    #         query_and_type = {
    #             "type": "query",
    #             "sql_query": query
    #         }
    #         table_data = Helpers.execute_sql_query(db_pool, db_params["database"], query_and_type)
    #         if isinstance(table_data, dict) and table_data.get('query_status') and table_data.get('results'):
    #             results = table_data['results']
    #             kpi_list = []
    #             for row in results: 
    #                 kpi_id = row.get('id')
    #                 kpi_name = row.get('name')
    #                 kpi_unit = row.get('unitOfMeasurement')
    #                 kpi_unit = "" if kpi_unit is None else kpi_unit 
    #                 kpi_list.append(f"{kpi_id},{kpi_name},{kpi_unit}")
    #             result_string = "kpiId, kpiName, kpiUnit:[\n" + "\n".join(kpi_list) + "\n]"
    #             return result_string
    #         else:
    #             CustomLogger.warning("Unexpected data format from database query")
    #             return ""
    #     except Exception as e:
    #         CustomLogger.exception(f"Error fetching KPI details: {str(e)}")
    #         return ""

    # @staticmethod
    # def get_system_details(agent_id):
    #     from process_main import ds_details
    #     try:
    #         agent_info = DataBaseManager.fetch_agent(agent_id)
    #         query = "SELECT id, name, shortName FROM cl_iba.IBA_System;"
    #         db_params = ds_details.get(agent_info['datasource_id'])
    #         db_pool = DataSourceConnector.connect(db_params)
    #         query_and_type = {
    #             "type": "query",
    #             "sql_query": query
    #         }
    #         table_data = Helpers.execute_sql_query(db_pool, db_params["database"], query_and_type)
    #         if isinstance(table_data, dict) and table_data.get('query_status') and table_data.get('results'):
    #             results = table_data['results']
    #             system_list = []
    #             for row in results:
    #                 system_id = row.get('id')
    #                 system_name = row.get('name')
    #                 system_short_name = row.get('shortName')
    #                 system_short_name = "" if system_short_name is None else system_short_name
    #                 system_list.append(f"{system_id},{system_name},{system_short_name}")
    #             result_string = "systemId, systemName, systemShortName:[\n" + "\n".join(system_list) + "\n]"
    #             return result_string
    #         else:
    #             CustomLogger.warning("Unexpected data format from database query")
    #             return ""
    #     except Exception as e:
    #         CustomLogger.exception(f"Error fetching system details: {str(e)}")
    #         return ""
