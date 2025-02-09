# TODO

## Things to implement

- [x] Implement parsing NPCs from yaml
- [x] Add Room:Square
- [x] Add Room:Shop 
- [x] Add descriptions to Shopkeeper 
- [x] Add Shopkeeper NPC to Shop
- [x] Implement describing NPCs in room
- [x] Implement looking at NPC
- [x] Add texts for shopkeeper
- [x] Implement overriding properties like `visible` for items
- [ ] Implement NPC Dialog logic
  - [x] Play welcome message
  - [x] Refactoring: Make `Command.execute()` async
  - [x] Call `UserInterface.displayMessageAsync()` for welcome message
  - [x] Display first questions
  - [x] Refactoring: extract methods to verify conditions from ActionTriggerExecutor
  - [x] Don't display message which preConditions are not met
  - [x] Keep on asking questions until user selects a Dialog with `exit == true`
  - [x] Implement handling enabled/disabled actions
  - [x] Implement handling next dialog
  - [x] Implement having the NPC respond to the chosen dialog
  - [x] When the ChoiceDialog has a response, make sure it is spoken
  - [x] Implement handling post-conditions
    - [x] Failure
    - [x] Success
  - [x] Add showing UserChoice to DefaultUserInterface
  - [x] Implement NPC Dialogs in UserInterface
  - [ ] Refactor `getUserChoice()` to use arrow keys
  - [x] Add Item:Lighter to Shop
  - [x] Add Item:Shovel to Shop
  - [x] Implement Selling Lighter and Shovel 
    - [x] Actions: Take / Add to inventory
    - [x] Reduce coins by price of item
  - [x] Say "You try to start a conversation, but it’s lonely out here." when talking to an NPC that isn't there 

## Things to improve

- [x] Use Command Pattern in GameController
- [x] Refactor TalkCommand using clean code principles
- [x] Move `What?` response from CommandProcessor to GameController
- [x] Remove ui instance variable from CommandProcessor
- [ ] Move tests from game-controller.test to command.processor.test
- [ ] Remove method GameController.processCommand()
- [ ] Make GameLoop.commandProcessor private
- [ ] Try to remove public methods from GameController
  - [ ] getCurrentRoom()
  - [ ] getInventory()
  - [ ] findItem
  - [ ] displayInventory
