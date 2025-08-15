Interface design

1.Dispatcher lambda used for data manipulation

- createPlant() \- creates a new Plant  
- updatePlant() \- updates an already existing Plant  
- deletePlant() \- deletes an already existing Plant  
- getPlant() \- gets a Plant by its unique Uuid  
- getPlantList() \- gets a list of plants  
- getPlantListWithNoZone() \- gets a list of plants that have no zone delegated to them  
- createZone() \- creates a new Zone  
- updateZone() \- updates an already existing Zone  
- deleteZone() \- deletes an already existing Zone  
- getZone() \- gets a Zone by its unique Uuid  
- getZoneList() \- gets a list of zones  
- getPlantRecordList() \- gets a list of all plant records  
- createSchedule() \- creates plant records for plant care duties and sends notifications to Slack channel  
- getEmployeeNames() \- fetches all employee names from a Slack channel  
- getSchedule() \- gets all tasks/plant records for today  
- getScoreboard() \- gets a scoreboard of completed tasks

2.Slack bot lambda used for Slack interactions

- complete-task \- opens up a modal for completing a task  
- complete-task-modal \- completes a task   
- delegate-task \- delegates a task to the selected employee  
- /scoreboard \- shows the scoreboard to the Slack channel