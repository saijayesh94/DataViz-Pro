from pydantic import BaseModel, constr
from typing import List, Dict, Any, Optional

class Chat(BaseModel):
    agent_id: str
    user_id: str
    conversation_id: Optional[str]
    conversation: List[Dict[str, Any]]
    model_name: str
    column_data: Optional[Dict]

class updateTimestampsInQuery(BaseModel):
    sql_query: str
    agent_id:str
    type:str
    start_time:str
    end_time:str
    
class GetConv(BaseModel):
    user_id: str
    conversation_id: Optional[str]
    cache_data: bool
    #To save the cache_data in mongodb retrive cache_data to class from sqldb 

class GetDS(BaseModel):
    datasource_id: str
    type: str
    action: str
    index_name: Optional[str]
    schema_description: Optional[Dict]

class Prompt(BaseModel):
    agent_id: str
    action: str
    prompt: Optional[List]

class DelChat(BaseModel):
    conversation_id: str

class UpdateTitle(BaseModel):
    conversation_id: str
    title: constr(min_length=2)

class AddDashboardsGroups(BaseModel):
    user_id: str
    dashboard_id: Optional[str]
    dashboard_name: str
    group_name: Optional[str]

class FetchDashboards(BaseModel):
    dashboard_id: Optional[str]
    user_id: str
    cache_data:Optional[bool]

class SaveDashboards(BaseModel):
    user_id: str
    conversation_id: str
    conversation_index: int
    column_data: Dict
    chart_rec: Dict
    dashboard_id: str
    group_id: str
    item_title: str
    custom_style: Optional[str]

class UpdateDashboards(BaseModel):
    user_id: str
    dashboard_id: str
    dashboard_name: Optional[str]
    groups: Optional[List]

class DeleteDashboards(BaseModel):
    user_id: str
    dashboard_id: str

class Credentials(BaseModel):
    username: str
    password: str
    port: int
    host: str
    
class InsertDatasource(BaseModel):
    type: str
    action: Optional[str]
    ds_name: str
    display_name: str
    credentials: Optional[Credentials]

class GetDatasource(BaseModel):
    datasource_id: Optional[str]

class SavePrompt(BaseModel):
    agent_id: Optional[str]
    conversation_id: str
    conversation_index: List
    
class GenerateInsight(BaseModel):
    agent_id: str
    table_data: str
    
# Request model for login
class LoginRequest(BaseModel):
    username: str
    password: str
    type: Optional[str] = None

class ModifyTextSource(BaseModel):
    datasource_id: str
    document_id: Optional[str]
    action: str
    content: Optional[str]
    
# class to sync single message and also check under GetConv class from sqldb 
class SyncMessage(BaseModel):
    user_id: str
    convo_id:str
    convo_index:int

class InsertAgent(BaseModel):
    agent_id:Optional[str]
    name: str
    action: Optional[str]  # Optional action field to specify insert or update
    type: str
    datasource_id: str
    rag_datasources: List[str]

# Define models for users collection
class User(BaseModel):
    user_id:Optional[str]
    inserted_by_mailid:str
    name: Optional[str]
    mailid: str
    type:str
    action: str
    password: str
    accessList: List[str]

class signupUser(BaseModel):
    name: Optional[str]
    mailid: str
    password: str
    orgName:str

class GetUsers(BaseModel):
    mailid:str

class VerifyTok(BaseModel):
    token: str

# class autoFillTextSource(BaseModel):
#     agent_id:str 

class TestPreview(BaseModel):
    agent_id: str
    type:str
    sql_query:str