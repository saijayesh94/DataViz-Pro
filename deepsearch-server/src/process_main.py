import re, os
import time
from jose import jwt
import copy

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Depends, Header
from datetime import datetime, timedelta
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from llms.llm import LLMAgent
from utils.helpers import Helpers
from utils.logger import CustomLogger
from database.manager import DataBaseManager
from datasource.connectors import DataSourceConnector
from datasource.helpers.schema_description import SchemaDescription
from datasource.helpers.models import (
                                       Chat, GetDS, GetConv,
                                       Prompt, DelChat, UpdateTitle,
                                       LoginRequest, ModifyTextSource,
                                       UpdateDashboards, DeleteDashboards,
                                       AddDashboardsGroups, FetchDashboards, SaveDashboards, VerifyTok,
                                       InsertDatasource, GetDatasource, SavePrompt, GenerateInsight ,SyncMessage, InsertAgent, User, GetUsers, signupUser, updateTimestampsInQuery, TestPreview #, autoFillTextSource
                                    )

app = FastAPI()
CustomLogger.info("\n*******Loading Server*******")
# router = APIRouter()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Authorization"],
)   

helpers = Helpers()
schema = SchemaDescription()
       
mongo_conn_obj = DataBaseManager.connect_db()
ds_details = DataBaseManager.ds_details()

# ALGORITHM = os.getenv("ALGORITHM")
# SECRET_KEY = os.getenv("SECRET_KEY")
# ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("TOKEN_EXPIRE_MINUTES"))

# def refresh_token(token: str = Header(...)):
#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])  # Verify and decode token
        
#         # Check expiration
#         exp_timestamp = payload.get('exp')
#         exp_datetime = datetime.fromtimestamp(exp_timestamp)
#         time_until_expire = exp_datetime - datetime.utcnow()
        
#         # If more than 5 mins remaining, return existing token
#         if time_until_expire.total_seconds() >= 300:
#             return {'payload': payload,
#                     'new_token': None}
            
#         # If less than 5 mins remaining, create new token
#         if time_until_expire.total_seconds() > 0:
#             new_payload = {
#                 "email": payload["email"],
#                 "org_id": payload["org_id"],
#                 "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
#             }
#             new_token = jwt.encode(new_payload, SECRET_KEY, algorithm=ALGORITHM)
#             payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM]) 
#             return {'payload': payload,
#                     'new_token': new_token}
            
#     except jwt.ExpiredSignatureError as e:
#         CustomLogger.exception(f"Token expired {e}")
#         return False
    
#     except jwt.JWTError as e:
#         CustomLogger.exception(f"Invalid token {e}")
#         return False

@app.post("/chat")
async def chat(conv_data: Chat):
    CustomLogger.info("\nEndpoint: '/chat':") 
    try:
        agent_info = DataBaseManager.fetch_agent(conv_data.agent_id)

        # Agent Type: Dashboard Agent
        if agent_info['type'] == 'dashboard_agent':
            db_params = ds_details.get(agent_info['datasource_id'])  # Retrieve database parameters based on the datasource_id associated with the agent
            db_pool = DataSourceConnector.connect(db_params)

            search_result, rag_data = DataBaseManager.similarity_search(ds_details, agent_info["rag_datasources"],conv_data.conversation[-1]["content"])
            # conv_data.conversation[-1]["content"] = search_result  # remove this line
            doc_obj = DataBaseManager.conversation_exists(conv_data, conv_data.agent_id)

            start_time = time.time()
            completion_response = LLMAgent(conv_data.model_name).chat_completion(doc_obj, str(search_result)) # send search_result 
            end_time = time.time(); execution_time = end_time - start_time
            CustomLogger.info(f"Time taken for llm response: {execution_time} seconds")

            column_meta_data = {}
            columns_metadata = DataBaseManager.get_columns_metedata(agent_info['datasource_id'])

            start_time_sql = time.time()
            sql_resp = helpers.execute_sql_query(db_pool, db_params['database'], completion_response["llm_json"], columns_metadata)
            end_time_sql = time.time(); execution_time_sql = end_time_sql - start_time_sql
            CustomLogger.info(f"Time taken for SQL execution: {execution_time_sql} seconds")
    
            response = helpers.create_response(completion_response, sql_resp)
            # CustomLogger.info(f"response = helpers.create_response ===={response}")
            if conv_data.column_data:
                column_meta_data = {**sql_resp["column_data"], **conv_data.column_data}
            
            column_data_final=column_meta_data if conv_data.column_data else sql_resp["column_data"]

            # CustomLogger.info(f"conv_data: {conv_data}")
            id = DataBaseManager.store_conversation(completion_response, conv_data, response, column_data_final)
            # conv_data.conversation[-1]["search_result"] = search_result
            response["rag_data"]=rag_data
            conv_data.conversation.append(response)
            
            resp = {"agent_id": conv_data.agent_id, "conversation_id": id, "user_id": conv_data.user_id, "title": doc_obj["title"], "conversation": conv_data.conversation, "column_data": column_meta_data if conv_data.column_data else sql_resp["column_data"]}
            return {"status": "success", "message": "", "resp_obj": resp}
        
    except Exception as e:
        CustomLogger.exception(f"Error in chat: {str(e)}")
        return {"status": "fail", "message": "Internal Server Error!!:", "resp_obj": ""}
    
@app.post("/testpreview")
async def testpreview(conv_data: TestPreview):
    CustomLogger.info("\nEndpoint: '/testpreview':") 
    try:
        agent_info = DataBaseManager.fetch_agent(conv_data.agent_id)
        if agent_info['type'] == 'dashboard_agent':

            db_params = ds_details.get(agent_info['datasource_id'])
            db_pool = DataSourceConnector.connect(db_params)
            columns_metadata = DataBaseManager.get_columns_metedata(agent_info['datasource_id'])
            CustomLogger.info(f"conv_data.sql_query ::: {conv_data}")
            llm_response = {
                "type": conv_data.type, 
                "sql_query": conv_data.sql_query  
            }
            sql_resp = helpers.execute_sql_query(db_pool, db_params['database'], llm_response, columns_metadata)

            return {"status": "success", "message": "", "resp_obj": sql_resp}
        
    except Exception as e:
        CustomLogger.exception(f"Error in chat: {str(e)}")
        return {"status": "fail", "message": "testpreview Error!!:", "resp_obj": ""}

@app.post("/get_data_source_details")
def get_data_source_details(ds_req: GetDS):
    CustomLogger.info("\nEndpoint: '/get_data_source_details':")
    try:
        if ds_req.action == "fetch":
            if ds_req.type == "mysql":
                datasource_data = DataBaseManager.fetch_mysql_datasource(ds_req)

            if ds_req.type == "text_source":
                datasource_data = DataBaseManager.fetch_text_datasource(ds_req, ds_details)

            return {
                "status": "success", 
                "message": "Datasource schema fetched successfully!",
                "resp_obj": datasource_data
            }

        elif ds_req.action == "update":
            if ds_req.type == "mysql":
                DataBaseManager.update_datasource_schema(ds_req)

            if ds_req.type == "text_source":
                DataBaseManager.create_text_source_index(ds_req, ds_details)

            return {
                "status": "success",
                "message": "Update operation successful!",
                "resp_obj": ""
            }

    except Exception as e:
        CustomLogger.exception(f"Error occurred while fetching/updating data source schema for: {ds_req.ds_name}: {str(e)}")
        return {"status": "fail", "message": f"Error occurred while fetching/updating data source schema for: {ds_req.ds_name}", "resp_obj": ""} 

@app.post("/get_data_source_details/modify_text_source")
def modify_text_source(ins_ts: ModifyTextSource):
    CustomLogger.info("\nEndpoint: '/get_data_source_details/modify_text_source':")
    try:
        ds_name = ds_details.get(ins_ts.datasource_id, {}).get('datsource')
        CustomLogger.info(f"{ds_name}")
        resp = DataBaseManager.modify_text_source(ins_ts, ds_name)
        
        return {
            "status": "success",
            "message": f"{ins_ts.action} operation for {ds_name} successfull!",
            "resp_obj": resp
        }

    except Exception as e:
        CustomLogger.exception(f"Error occurred while {ins_ts.action}ing for: {ds_name}: {str(e)}")
        return {
            "status": "fail",
            "message": f"Error occurred while {ins_ts.action}ing for: {ds_name}", 
            "resp_obj": ""
        } 

# To sync single message inside a conversation  gamma from sqldb
@app.post("/sync_message")
def sync_message(_id: SyncMessage):
    try:
        resp = DataBaseManager.sync_message(_id)
        return resp
    except Exception as e:
        CustomLogger.exception(f"Error occurred while fetching conversations': {str(e)}")
        return {"status": "fail", "message": "Error occurred while fetching conversations", "resp_obj": ""}

@app.post("/get_conversations")
def get_conversations(_id: GetConv):
    """
    Fetches conversations based on the provided ID.

    Parameters: 'ID'

    Returns: dict: {"status": "", "message": "", "resp_obj": ""}
    """
    CustomLogger.info("\nEndpoint: '/get_conversations':")
    try:

        resp = DataBaseManager.get_conversations(_id)
        return resp 
    
    except Exception as e:
        CustomLogger.exception(f"Error occurred while fetching conversations': {str(e)}")
        return {"status": "fail", "message": "Error occurred while fetching conversations", "resp_obj": ""}
       
@app.post("/generate_prompt")
def generate_prompt(gen_prmpt : Prompt):
    CustomLogger.info("\nEndpoint: '/generate_prompt':")
    try:
        if gen_prmpt.action == "fetch":
            result = DataBaseManager.find_prompt(gen_prmpt)
            return {"status": "success", "message": "", "resp_obj": result}
        
        if gen_prmpt.action == "update":
            ds_schema = DataBaseManager.find_schema(gen_prmpt)
            description = schema.generate_database_description(ds_schema)

            org_prompt = copy.deepcopy(gen_prmpt.prompt[0])

            for placeholder, value in description.items():
                placeholder_pattern = r"<" + re.escape(placeholder) + ">"
                replacement = f"{placeholder}: {value}"
                gen_prmpt.prompt[0]['content'] = re.sub(placeholder_pattern, replacement, gen_prmpt.prompt[0]['content'])
            
            response = DataBaseManager.update_prompt(gen_prmpt, gen_prmpt.prompt, org_prompt)
            CustomLogger.info(f"Responseee: {response}")

            response['prompt'][0] = org_prompt

        return {"status": "success", "message": "Prompt updated successfully!", "resp_obj": response}
    
    except Exception as e:
        CustomLogger.exception(f"Something went wrong while generating prompt: {str(e)}")
        return {"status": "fail", "message": "Something went wrong while generating prompt", "resp_obj": ""}
    
@app.post("/delete_chat")
def delete_chat(del_chat : DelChat):
    CustomLogger.info("\nEndpoint: '/delete_chat':")
    try:
        DataBaseManager.del_chat(del_chat)
        CustomLogger.info(f"Conversation deleted successfully for id: {del_chat.conversation_id}")
        return {"status": "success", "message": f"Conversation deleted successfully for id: {del_chat.conversation_id}", "resp_obj": ""}
    
    except Exception as e:
        CustomLogger.exception(f"Something went wrong while deleting conversation: {str(e)}")
        return {"status": "fail", "message": "Something went wrong while deleting conversation", "resp_obj": ""}
    
@app.post("/update_title")
def update_title(update_payload : UpdateTitle):
    CustomLogger.info("\nEndpoint: '/update_title':")
    try:
        DataBaseManager.update_title(update_payload)
        CustomLogger.info(f"title successfully updated for id: {update_payload.conversation_id}")
        return {"status": "success", "message": f"title successfully updated for id: {update_payload.conversation_id}", "resp_obj": ""}
    
    except Exception as e:
        CustomLogger.exception(f"Something went wrong while updating title: {str(e)}")
        return {"status": "fail", "message": "Something went wrong while updating title", "resp_obj": ""}
    
@app.post("/dashboards/add")
def create_dashboards_groups(dash_grps: AddDashboardsGroups):
    CustomLogger.info("\nEndpoint: '/dashboards/add':")
    try:
        return DataBaseManager.create_dash_grps(dash_grps)
  
    except Exception as e:
        CustomLogger.exception(f"Something went wrong while creating dashboards/groups: {str(e)}")
        return {"status": "fail", "message": "Something went wrong while creating dashboards/groups", "resp_obj": ""}

@app.post("/dashboards/fetch")
def fetch_dashboards(fetch_dash: FetchDashboards):
    CustomLogger.info("\nEndpoint: '/dashboards/fetch':")
    try:
        if fetch_dash.dashboard_id is None:  # Without ID
            fetch_resp = DataBaseManager.fetch_all_dashboards(fetch_dash)
            return {"status": "success", "message": "Dashboards fetched successfully", "resp_obj": fetch_resp}
        
        elif fetch_dash.dashboard_id:  # With ID
            fetch_resp = DataBaseManager.fetch_single_dashboard(fetch_dash)
            return {"status": "success", "message": f"Dashboards fetched successfully for Id: {fetch_dash.dashboard_id}", "resp_obj": fetch_resp}
        
    except Exception as e:
        CustomLogger.exception(f"Something went wrong while fetching dashboards: {str(e)}")
        return {"status": "fail", "message": "Something went wrong while fetching dashboards", "resp_obj": ""}
    
@app.post("/dashboards/save_item")
def save_dashboards_items(save_dash: SaveDashboards):
    CustomLogger.info("\nEndpoint: '/dashboards/save_item':")
    try:
        DataBaseManager.save_dashboards(save_dash)
        return {"status": "success", "message": "Dashboards Saved successfully", "resp_obj": ""}

    except Exception as e:
        CustomLogger.exception(f"Something went wrong while saving dashboards: {str(e)}")
        return {"status": "fail", "message": "Something went wrong while saving dashboards", "resp_obj": ""}

@app.post("/dashboards/update")
# @router.post("/dashboards/update")
def update_dashboards(update_dash: UpdateDashboards):
    try:
        DataBaseManager.update_dashboards(update_dash)
        return {"status": "success", "message": "Dashboards Updated successfully", "resp_obj": ""}

    except Exception as e:
        CustomLogger.exception(f"Something went wrong while updating dashboards: {str(e)}")
        return {"status": "fail", "message": "Something went wrong while updating dashboards", "resp_obj": ""}

@app.post("/dashboards/delete")
# @router.post("/dashboards/delete")
def delete_dashboards(del_dash: DeleteDashboards):
    try:
        final_resp = DataBaseManager.delete_dashboards(del_dash)
        return {"status": "success", "message": "Dashboards Deleted successfully", "resp_obj": final_resp}

    except Exception as e:
        CustomLogger.exception(f"Something went wrong while deleting dashboards: {str(e)}")
        return {"status": "fail", "message": "Something went wrong while deleting dashboards", "resp_obj": ""}

@app.post("/insert_datasource")
def insert_datasource(ins_ds: InsertDatasource):
    CustomLogger.info("\nEndpoint: '/insert_datasource'")
    try:
        global ds_details   # global variable to store datasource credentials (for type--> mysql)
        if ins_ds.type == "mysql":
            if ins_ds.action == "test":
                resp = DataSourceConnector.test_connection(ins_ds)  

                return {"status": "success", "message": f"Test Connection to Datasource: {ins_ds.ds_name} successfull!", "resp_obj": ""} \
                if resp \
                else {"status": "fail", "message": f"Test Connection to Datasource: {ins_ds.ds_name} failed!", "resp_obj": ""}

            elif ins_ds.action == "insert":
                # Connect to the database using the provided datasource information
                conn_obj = DataSourceConnector.connect(ins_ds)

                # Get the schema description (tables and columns) of the datasource
                schema_desp = SchemaDescription.get_datasource_schema(conn_obj, ins_ds)
                # Auto Generate column description 
                table_data = schema_desp['schema_description']['tables']
                table_data_fill = LLMAgent.fill_column_description(table_data)
                # CustomLogger.info(f"FILLED TABLE DATA: {table_data_fill}")

                schema_desp['schema_description']['tables'] = table_data_fill
                # CustomLogger.info(f"Schema Descrirption: {schema_desp}")

                # Insert the datasource information and schema description into MongoDB
                resp = DataBaseManager.insert_mysql_datasource(ins_ds, schema_desp, ds_details)
                
                return {"status": "success", "message": f"Datasource: {ins_ds.ds_name} inserted successfull", "resp_obj": resp} \
                if resp \
                else {"status": "fail", "message": f"Datasource: {ins_ds.ds_name} insertion failed", "resp_obj": ""}
                
        if ins_ds.type == "text_source":
            # Attempt to create a new collection for the text source in MongoDB
            resp = DataBaseManager.create_text_source_collection(ins_ds.ds_name)
            if resp:
                # If the collection is created successfully, insert the text source into the MongoDB
                DataBaseManager.insert_text_source(ins_ds, ds_details)  # Add to global variable
            
            return {"status": "success", "message": f"Datasource: {ins_ds.ds_name} inserted successfull", "resp_obj": resp} \
            if resp \
            else {"status": "fail", "message": f"Datasource: {ins_ds.ds_name} insertion failed", "resp_obj": ""}

    except Exception as e:
        CustomLogger.exception(f"Something went wrong while inserting datasources: {str(e)}")
        return {"status": "fail", "message": "Something went wrong while inserting datasources", "resp_obj": ""}

@app.post("/get_datasources")
# @router.post("/get_datasources")
def get_datasources(get_ds: GetDatasource):
    try:
        resp = DataBaseManager.get_datasources()
        return {"status": "success", "message": "Datasource Fetched successfully", "resp_obj": resp}

    except Exception as e:
        CustomLogger.exception(f"Something went wrong while getting datasources: {str(e)}")
        return {"status": "fail", "message": "Something went wrong while getting datasources", "resp_obj": ""}

@app.post("/save_to_prompt")
# @router.post("/save_to_prompt")
def save_to_prompt(savePmt: SavePrompt):
    try:
        DataBaseManager.save_to_prompt(savePmt)
        return {"status": "success", "message": "Prompt saved successfully", "resp_obj": ""}

    except Exception as e:
        CustomLogger.exception(f"Something went wrong while saving prompt: {str(e)}")
        return {"status": "fail", "message": "Something went wrong while saving prompt", "resp_obj": ""}

@app.post("/generate_insight")
def generate_insight(genIns: GenerateInsight):
    try:
        promt_data = DataBaseManager.find_prompt(genIns)
        llm_agent = LLMAgent('gpt-35-turbo-16k')
        new_messages = [promt_data["prompt"][0], {"role":"user", "content": genIns.table_data + " Give me unique insights based on the data in plain text format only."}]
        gpt_resp = llm_agent.basic_chat_completion(new_messages)
        return {"status": "success", "message": "Prompt saved successfully", "resp_obj": gpt_resp}

    except Exception as e:
        CustomLogger.exception(f"Something went wrong while saving prompt: {str(e)}")
        return {"status": "fail", "message": "Something went wrong while saving prompt", "resp_obj": ""}

@app.post("/fetch_all_agents")
def fetch_all_agents():
    try:
        resp = DataBaseManager.get_agents()
        return {"status": "success", "message": "agents fetched successfully", "resp_obj":resp}
    except Exception as e:
        CustomLogger.info(f"Something went wrong while fetching agents.")
        return {"status": "fail", "message": "Something went wrong while fetching agents", "resp_obj": ""}


@app.post("/insert_agent")
def insert_agent(agent_data: InsertAgent):
    CustomLogger.info("\nEndpoint: '/insert_agent':")
    try:
        if agent_data.action == "insert":
            # Perform the insert operation
            resp = DataBaseManager.insert_agent(agent_data)
            return {"status": "success", "message": "Agent inserted successfully!", "resp_obj": resp}
        
        elif agent_data.action == "update":
            if not agent_data.agent_id:
                return {"status": "fail", "message": "agent_id is required for update", "resp_obj": ""}
            # Perform the update operation
            resp = DataBaseManager.update_agent(agent_data)
            return {"status": "success", "message": "Agent updated successfully!", "resp_obj": resp}

        else:
            return {"status": "fail", "message": "Invalid action specified", "resp_obj": ""}
    
    except Exception as e:
        CustomLogger.exception(f"Something went wrong while inserting/updating agent: {str(e)}")
        return {"status": "fail", "message": "Something went wrong while inserting/updating agent", "resp_obj": ""}

@app.post("/updatetimestampsinquery")
def updatetimestampsinquery(payload: updateTimestampsInQuery):
    try:
        resp = LLMAgent.update_timestamps_in_query(payload.sql_query, payload.start_time, payload.end_time)
        agent_info = DataBaseManager.fetch_agent(payload.agent_id)
        if agent_info['type'] == 'dashboard_agent':

            db_params = ds_details.get(agent_info['datasource_id'])
            db_pool = DataSourceConnector.connect(db_params)
            columns_metadata = DataBaseManager.get_columns_metedata(agent_info['datasource_id'])
            llm_response = {
                "type": payload.type,
                "sql_query": resp['sql_query']
            }
            sql_resp = helpers.execute_sql_query(db_pool, db_params['database'], llm_response, columns_metadata)
            sql_resp["sql_query"] = resp['sql_query']
        return {"status": "success", "message": "Time stamps are updated in SQL Query ", "resp_obj": sql_resp}

    except Exception as e:
        CustomLogger.exception(f"Something went wrong while updating sql query: {str(e)}")
        return {"status": "fail", "message": "Something went wrong while updating sql query", "resp_obj": ""}

# @app.post("/autofilltextsource")
# def autofilltextsource(payload: autoFillTextSource):
#     try:
#         agent_id=payload.agent_id
#         CustomLogger.info(f"autoFillTextSource : {payload}")
#         kpi_text = DataBaseManager.get_kpi_details(agent_id)
#         system_details_text = DataBaseManager.get_system_details(agent_id)
#         return {"status": "success", "message": "KPI details fetched successfully", "resp_obj": kpi_text+"\n\n"+system_details_text}
#     except Exception as e:
#         CustomLogger.exception(f"Something went wrong while getting system/kpi details: {str(e)}")
#         return {"status": "fail", "message": "Something went wrong while getting system/kpi details", "resp_obj": ""}

########################################################
# FRONT END RELATED APIs - For Dummy User managememnt ##
########################################################
# In-memory allowed emails
allowed_domains = [
    '@digitalblanket.ai',
    '@deepnetlabs.com',
    '@digitalblanket.ai',
    '@flamencotech.com',
    '@capitaland.com',
    '@ibusnetworks.com'
]

def is_allowed_email(email: str) -> bool:
    return any(email.endswith(domain) for domain in allowed_domains)

@app.post("/insert_user")
def insert_user(user_data: User):
    try:
        if user_data.action == "insert":
            resp = DataBaseManager.insert_user(user_data)
            return resp
        # elif user_data.action == "update":
        #     resp = DataBaseManager.update_user(user_data)
        #     return  resp
        elif user_data.action == "delete":
            resp = DataBaseManager.delete_user(user_data)
            return  resp
        else:
            return {"status": "fail", "message": "Invalid user data", "resp_obj": ""}
    
    except Exception as e:
        CustomLogger.exception(f"Something went wrong while inserting user: {str(e)}")
        return {"status": "fail", "message": "Something went wrong while inserting user", "resp_obj": ""}

@app.post("/signup_user")
def signup_user(user_data: signupUser):
    try:
        resp = DataBaseManager.signup_user(user_data)
        return {"status": "success", "message": "signup successful", "resp_obj": resp}
    except Exception as e:
        CustomLogger.exception(f"Something went wrong while inserting user: {str(e)}")
        return {"status": "fail", "message": "Something went wrong while inserting user", "resp_obj": ""}


@app.post("/fetch_users")
def fetch_users(user_data: GetUsers):  # token_data: str = Depends(refresh_token)
    try:
        # if not token_data:
        #     return {"status": "fail", "message":"Invalid token", "resp_obj": ""}
        
        # CustomLogger.info(f"Token Data: {token_data['payload']}")
        result = DataBaseManager.get_users(user_data)
        # result['new_token'] = token_data['new_token']

        return result
        
    except Exception as e:
        CustomLogger.exception(f"Something went wrong while fetching user: {str(e)}")
        return {"status": "fail", "message": "Something went wrong while fetching user", "resp_obj": ""}


@app.post("/api/login/outLogin")
# @router.post("/api/login/outLogin")
async def out_login():
    global access
    access = ''
    return JSONResponse(content={"data": {}, "success": True})


# @app.post("/api/login/account")
# async def login_account(request: LoginRequest):
#     try:
#         resp = DataBaseManager.verify_user(request)  # Add a fail mechanism if verify fsils
#         token = helpers.create_jwt_token(request.username, resp[3])

#         if resp[0] == True:
#             return JSONResponse(content={
#             "status": "ok",
#             "access_token": token,
#             "type": resp[1],
#             "email": request.username,
#             "accessList":resp[2]
#             })

#     except Exception as e:
#         CustomLogger.exception(f"Something went wrong while login: {str(e)}")

# @app.get("/verify-token")
# async def verify_token(veri_tok : VerifyTok):
#     decoded = helpers.decode_jwt_token(veri_tok.token)
#     if decoded:
#         return {"status": "valid", "token_data": decoded}
#     return {"status": "invalid"}

@app.post("/api/login/account")
# @router.post("/api/login/account")
async def login_account(request: LoginRequest):
    global access
    username = request.username
    password = request.password
    type = request.type

    if password == 'admin@123' and is_allowed_email(username):
        access = 'admin'
        return JSONResponse(content={
            "status": "ok",
            "type": type,
            "currentAuthority": "admin",
            "email": username,
            "accessList":[]
        })

    if not is_allowed_email(username):
        resp = DataBaseManager.verify_user(request)
        if resp[0] == True:
            return JSONResponse(content={
            "status": "ok",
            "type": type,
            "currentAuthority": resp[1],
            "email": username,
            "accessList":resp[2]
            })


