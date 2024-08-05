***War Card Game***
----------------------

**Installing**\
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
once Phaser editor is installed you can easily run it using the command: npx phasereditor2dlauncher -project <your/path/to/project>
for opening a web server on localhost: open terminal from your folder in the code
editor and run npx http-server



**Game Rules:**
* game starts with the cards deck in the middle and a 'Deal' button to deal the cards to the players. after click - the button would disappear.
* 2 players (1 real, 1 fake).
* deck of 52 shuffled and hidden (face down) cards (disregard joker's and suites)
* each player get 26 cards from the deck.
* when deal ends, a battle starts.
* each turn (battle) the players reveal the top card from their deck, the highest ranked card wins and both of the cards are added to the winning player's deck.
* war - happens on a battle tie (2 cards of the same rank).
    * each player adds another 3 hidden cards above their first card.
    * start a battle - the winner takes all war cards (also the hidden ones)
* game over when one of the players loses its deck entirely, at any point (middle of battle / war).
* *Advanced:* auto play button - you can toggle on/off automatic play for the user, this option is available at any time while the game is active.
