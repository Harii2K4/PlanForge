from .custom_tool import BoardDataFetcherTool, CardDataFetcherTool, UserDataFetcherTool

# Create aliases to match the imports expected in crew.py
TrelloBoardDataFetcherTool = BoardDataFetcherTool
TrelloCardDataFetcherTool = CardDataFetcherTool
TrelloUserDataFetcherTool = UserDataFetcherTool

__all__ = [
    "BoardDataFetcherTool",
    "CardDataFetcherTool", 
    "TrelloBoardDataFetcherTool",
    "TrelloCardDataFetcherTool",
    "TrelloUserDataFetcherTool"
]
