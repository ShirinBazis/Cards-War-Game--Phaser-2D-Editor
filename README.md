***War Card Game***
----------------------

**Part 1**\
In order to start working on the project, please follow the instructions below (if you installed one of the
following already, just skip to the next):
1. install the latest nodeJS version.
2. open cmd from project folder and run the command npm i .
3. install typescript - open cmd from project folder and run the command npm i -g typescript .
4. install Phaser engine - go to: https://phaser.io/download/stable, or open cmd from project folder and run the command npm i phaser .
5. install Phaser editor (optional, for convenience) - https://help-v3.phasereditor2d.com/firststeps/install-core.html
6. install code editor (as visual code IDE).

because those are typescript files, before running the game and after every change, you need to
compile the files, open the terminal on the root directory and run the command - npm run build
once Phaser editor is installed you can easily run it using the command: npx phasereditor2dlauncher -project <your/path/to/HomeAssignment>
for opening a web server on localhost: open terminal from your HomeAssignment folder in the code
editor and run npx http-server



**Part 2**\
Game Rules:
* 2 players (1 real, 1 fake).
* deck of 52 shuffled and hidden(face down) cards (disregard joker's and suites)
* each player get 26 cards from the deck.
* each turn (battle) the players reveal the top card from their deck, the highest ranked card wins and both of the cards are added to the winning player's deck.
* war - happens on a battle tie (2 cards of the same rank).
    * each player adds another 3 hidden cards above their first card.
    * start a battle - the winner takes all war cards (also the hidden ones)
* game over when one of the players loses its deck entirely, at any point (middle of battle / war).

  
Guidelines:
* game starts with the cards deck in the middle.
* create a 'Deal' button to deal the cards to the players - after click - the button should disappear.
* when deal ends, show text indication: "battle!"
* after the text indication, run through the turns when:
    fake player reveals card automatically on turn start.
    fake player automatically adds cards on war
    fake player automatically add winning cards (when won).
    turn ends when winning player finished adding cards to its deck.
    should wait for real player card reveal (click on cards deck).
* when in war:
    add text indication "war!".
    add text indication on war lose / win - have 3 different phrases for each state.
* game end (win or lose)
    show proper text indication, examples:
    win - "You Won!"
    lose - "Try Again"


**Part 3 - Advanced**
* sounds:
  add indication sounds for:
    battle win / lose
    war win / lose
    game win / lose
    add click sound for buttons ("deal" button, player's deck)
* auto play mode - add an option to toggle on/off automatic play for the user, this option should be available at any time while the game is active.
* gamble mode - when in a war - player can gamble if he will draw the high/low card at the end battle,
  3 cases to address:
  if gamble is correct - war enters another phase (even if player had the lower card at the end battle).
  if gamble is incorrect - war ended with a loss to the player and has all the normal loss effects (all war cards are taken).
  if war ends in tie - gamble is ignored and should be requested again on the 2nd phase of the war.
