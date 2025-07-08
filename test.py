import json

# Load the JSON from result.json and convert it to dictionary
with open('C:/Users/harik/OneDrive/Desktop/Crews/project_planner/result.json', 'r') as f:
    result_dict = json.load(f)
print(result_dict["tasks"])







