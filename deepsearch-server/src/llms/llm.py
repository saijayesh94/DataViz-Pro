import json, os, requests, copy
from dotenv import load_dotenv
from openai import AzureOpenAI
from litellm import completion

import google.generativeai as genai
from utils.logger import CustomLogger


load_dotenv()

GPT_35_TURBO = {
        "API_VERSION": os.getenv("API_VERSION_35"),
        "AZURE_OPENAI_API_KEY": os.getenv("AZURE_OPENAI_API_KEY_35"),
        "AZURE_OPENAI_ENDPOINT": os.getenv("AZURE_OPENAI_ENDPOINT_35")
    }

GPT_4 = {
        "API_VERSION": os.getenv("API_VERSION_4"),
        "AZURE_OPENAI_API_KEY": os.getenv("AZURE_OPENAI_API_KEY_4"),
        "AZURE_OPENAI_ENDPOINT": os.getenv("AZURE_OPENAI_ENDPOINT_4")
    }

MISTRAL_KEY = {
        "AWS_ACCESS_KEY_ID": os.getenv("AWS_ACCESS_KEY_ID"),  # PUT IN .env
        "AWS_SECRET_ACCESS_KEY": os.getenv("AWS_SECRET_ACCESS_KEY"),
        "AWS_REGION_NAME": os.getenv("AWS_ACCESS_KEY_ID") 
    }

MODEL_MAPPING = {
        "gpt-4": GPT_4,
        "gpt-35-turbo-16k": GPT_35_TURBO,
        "mistral": MISTRAL_KEY
    }

class LLMAgent:

    def __init__(self, model_name):
        self.model = model_name
        self.configure_llm_model()
            
    def chat_completion(self, doc_obj, search_result):
        local_llm_message = copy.deepcopy(doc_obj)
        local_llm_message["messages"][-1]['content'] = search_result

        if "gpt" in self.model:
            response = self.client.chat.completions.create(
                model= self.model,
                messages=local_llm_message["messages"],
                temperature=0.5,
                max_tokens=800,
                top_p=0.95,
                frequency_penalty=0,
                presence_penalty=0,
                stop=None
            )
            chat_data_raw = dict(response.choices[0].message)  # GPTs response to latest message
            chat_data = {key: chat_data_raw[key] for key in ['content', 'role']}
    
            CustomLogger.info(f"GPT's Response: {response.choices[0].message.content}")
            llm_custom_json = json.loads(response.choices[0].message.content)  # Converting the GPTs response to a Json.
        
        elif self.model == "mistral":
            response= completion(
                model='bedrock/mistral.mixtral-8x7b-instruct-v0:1',
                messages=local_llm_message["messages"],

                aws_access_key_id=MISTRAL_KEY["AWS_ACCESS_KEY_ID"],
                aws_secret_access_key=MISTRAL_KEY["AWS_SECRET_ACCESS_KEY"],
                aws_region_name=MISTRAL_KEY["AWS_REGION_NAME"],
            )

            chat_data_raw = dict(response.choices[0].message)  # GPTs response to latest message
            chat_data = {key: chat_data_raw[key] for key in ['content', 'role']}
    
            CustomLogger.info(f"Mistral's Response: {response.choices[0].message.content}")
            llm_custom_json = json.loads(response.choices[0].message.content.replace("\\", ""))  # Converting the GPTs response to a Json.
        
        elif self.model == "gemini-1.5-flash":
            genai.configure(api_key='AIzaSyCPhEB434dxG95xH9ZEGYLSZ4Uf_LNaEcA')
            doc_obj_transformed = {
                "parts": [
                    {
                        "role": message["role"], 
                        "text": message["content"] 
                    } for message in local_llm_message["messages"]
                ]
            }
 
            generation_config = {
                "temperature": 1,
                "top_p": 0.95,
                "top_k": 64,
                "max_output_tokens": 8192,
                "response_mime_type": "application/json",
            }

            model = genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                generation_config=generation_config,
                system_instruction=json.dumps(doc_obj_transformed),  
            )
            
            chat_session = model.start_chat(history=[])
            latest_message = {
                "text": doc_obj_transformed["parts"][-1]["text"]
            }
            response = chat_session.send_message(latest_message)
            response_candidates = response.candidates 
            if response_candidates and len(response_candidates) > 0:
                response_content = response_candidates[0].content.parts[0].text
            else:
                response_content = "" 
 
            chat_data_raw = {
                "role": "assistant",
                "content": response_content
            }
            chat_data = {
                "content": chat_data_raw["content"],
                "role": chat_data_raw["role"]
            }
            # CustomLogger.info(f"Gemini's Response: {response_content}")
            llm_custom_json = json.loads(response_content)

        # elif self.model == "phi_3":
        #     url = "http://172.203.172.131:8001/chat"

        #     doc_obj["messages"][0]['role'] = 'user'
        #     # contents = [msg['content'] for msg in doc_obj['messages']]
        #     payload = {"messages": doc_obj["messages"]}

        #     CustomLogger.info(f"Payload: {payload}")
        #     headers = {'Content-Type': 'application/json'}
        #     response = requests.request("POST", url, headers=headers, data=json.dumps(payload))
        #     response = json.loads(json.loads(response.text)[0]["generated_text"])
        #     CustomLogger.info(f"PGI3 RAW response: {type(response)} {response}")

        #     chat_data_raw = {"role": "assistant", "content": json.dumps(response)}
        #     chat_data = {key: chat_data_raw[key] for key in ['content', 'role']}
    
        #     CustomLogger.info(f"Phi3's Response: {str(chat_data_raw)}")
        #     llm_custom_json = response
        #     CustomLogger.info(f"llm_custom_json: {type(llm_custom_json)} {llm_custom_json}")

        return {"id": doc_obj["message_id"], "llm_json": llm_custom_json, "chat_data": chat_data}
    
    def configure_llm_model(self):
        creds_gpt = MODEL_MAPPING.get(self.model)
        self.configure_client(creds_gpt)
     
    def configure_client(self, creds_gpt):
        if "gpt" in self.model:
            self.client = AzureOpenAI(
                api_key=creds_gpt.get("AZURE_OPENAI_API_KEY"),
                api_version=creds_gpt.get("API_VERSION"),
                azure_endpoint=creds_gpt.get("AZURE_OPENAI_ENDPOINT"),
            )

    def basic_chat_completion(self, messages):
        if "gpt" in self.model:
            response = self.client.chat.completions.create(
                model= self.model,
                messages=messages,
                temperature=0.5,
                max_tokens=800,
                top_p=0.95,
                frequency_penalty=0,
                presence_penalty=0,
                stop=None
            )
            return dict(response.choices[0].message)  # GPTs response to latest message

        # else:
        #     self.client = boto3.client(
        #         # service_name="bedrock-runtime",
        #         region_name=creds_gpt.get("AWS_REGION_NAME"),
        #         aws_access_key_id=creds_gpt.get("AWS_ACCESS_KEY_ID"),
        #         aws_secret_access_key=creds_gpt.get("AWS_SECRET_ACCESS_KEY"),
        #     )
    def fill_column_description(table_data):
        genai.configure(api_key='AIzaSyCPhEB434dxG95xH9ZEGYLSZ4Uf_LNaEcA')

        generation_config = {
        "temperature": 1,
        "top_p": 0.95,
        "top_k": 40,
        "max_output_tokens": 8192,
        "response_mime_type": "text/plain",
        }

        system_prompt = """You are an expert data analyst and metadata specialist. 
        Your task is to generate comprehensive and professional descriptions and display names for database table columns.
        Follow these guidelines:
        1. Provide clear, concise descriptions and display name that explain the meaning and purpose of each column
        2. Use business and technical language appropriate to the context
        3. Infer the column's significance from its name and potential use
        4. Return the response strictly in JSON format
        5. Maintain the original structure of the input JSON
        6. Focus on creating meaningful, informative descriptions"""

        model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        generation_config=generation_config,
        system_instruction=system_prompt
        )

        input_json = table_data  # pass table_data directly

        response = model.start_chat(history=[]).send_message(f"Generate descriptions for this table structure: {json.dumps(input_json)}")
        cleaned_json = json.loads(response.text.replace('```json', '').replace('```', '').strip())
        return (cleaned_json)

    def update_timestamps_in_query(sql_query, start_time, end_time):
        # self.configure_gemini()
        genai.configure(api_key='AIzaSyCPhEB434dxG95xH9ZEGYLSZ4Uf_LNaEcA')
        generation_config = {
        "temperature": 1,
        "top_p": 0.95,
        "top_k": 40,
        "max_output_tokens": 8192,
        "response_mime_type": "text/plain",
        }
        # system_prompt = """You are an expert data analyst and metadata specialist.
        # Your task is to replace the start date and end date in given sql query.
        # Follow these guidelines:
        # 1. Return the response strictly in JSON format.
        # 2. Do not change or update sql query apart from updating start date and end date.
        # response should be in this structure: '{' sql_query: '}'"""
        system_prompt = """
        Return only the SQL query as a json '{' sql_query: '}', modify the period's time range.
        Do not change or update sql query apart from updating start date and end date.
        For the following sql query, modify it if date time exists or a date range exists modified based on the following start date and end date
        """
        model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        generation_config=generation_config,
        system_instruction=system_prompt
        )
        # sql_query, agent_id, type, start_date, end_date
        response = model.start_chat(history=[]).send_message(f"For the following sql query {sql_query} modify it if date time exists or a date range exists, Modified based on the following start date {start_time}, end date: {end_time}")
        cleaned_json = json.loads(response.text.replace('```json', '').replace('```', '').strip())
        return (cleaned_json)
