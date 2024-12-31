# TODO

## Things to implement

- [x] Implement parsing NPCs from yaml
- [x] Add Room:Square
- [x] Add Room:Shop 
- [x] Add descriptions to Shopkeeper 
- [x] Add Shopkeeper NPC to Shop
- [x] Implement describing NPCs in room
- [x] Implement looking at NPC
- [ ] Add texts for shopkeeper
- [ ] Implement NPC Dialog logic
  - [x] Play welcome message
  - [x] Refactoring: Make `Command.execute()` async
  - [x] Call `UserInterface.displayMessageAsync()` for welcome message
  - [x] Display first questions
  - [x] Refactoring: extract methods to verify conditions from ActionTriggerExecutor
  - [x] Don't display message which preConditions are not met
  - [x] Keep on asking questions until user selects a Dialog with `exit == true`
  - [x] Implement handling enabled/disabled actions
  - [ ] Implement handling next dialog
  - [ ] Implement handling post-conditions
  - [ ] add ShowUserChoice to UserInterface
  - [x] Implement NPC Dialogs in UserInterface
  - [ ] Refactor `getUserChoice()` to use arrow keys
  - [ ] Add Item:Lighter to Shop
  - [ ] Add Item:Shovel to Shop
  - [ ] Implement Selling Lighter and Shovel (Actions: Take / Add to inventory)

## Things to improve

- [x] Use Command Pattern in GameController
