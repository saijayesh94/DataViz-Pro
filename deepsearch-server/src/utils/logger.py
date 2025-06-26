import os
import pytz
import datetime
import logging.handlers
from dotenv import load_dotenv

load_dotenv()

class CustomLogger:
    ist = pytz.timezone('Asia/Kolkata')
    logFile = os.getenv("LOG_PATH")

    logger = logging.getLogger("backend_log")
            
    handler = logging.handlers.TimedRotatingFileHandler(logFile, when='midnight')
    formatter = logging.Formatter('[%(levelname)s] - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.DEBUG)

    @staticmethod
    def debug(*args):
        local_time = datetime.datetime.now(CustomLogger.ist).strftime('%Y-%m-%d %H:%M:%S')
        log_message = ' '.join(map(str, args))
        CustomLogger.logger.debug(f"{local_time}: {log_message}")

    @staticmethod
    def info(log):
        local_time = datetime.datetime.now(CustomLogger.ist).strftime('%Y-%m-%d %H:%M:%S')
        CustomLogger.logger.info(str(local_time) + ": " + str(log))

    @staticmethod
    def exception(log):
        local_time = datetime.datetime.now(CustomLogger.ist).strftime('%Y-%m-%d %H:%M:%S')
        CustomLogger.logger.exception(str(local_time) + ": " + str(log))
        
    @staticmethod
    def error(log, exception=None):
        local_time = datetime.datetime.now(CustomLogger.ist).strftime('%Y-%m-%d %H:%M:%S')
        if exception:
            error_message = "{}: {} {}".format(local_time, log, exception)
        else:
            error_message = "{}: {}".format(local_time, log)
        CustomLogger.logger.error(error_message)