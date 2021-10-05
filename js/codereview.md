# Code Review for Falling Palms

## Table of Contents
- [Code Review for Falling Palms](#code-review-for-falling-palms)
	- [Table of Contents](#table-of-contents)
	- [Files](#files)
		- [index.js](#indexjs)
			- [Evaluation](#evaluation)
		- [KeyboardController.js](#keyboardcontrollerjs)
			- [Evaluation](#evaluation-1)
		- [ThreeManager.js](#threemanagerjs)
			- [Evaluation](#evaluation-2)
		- [CannonManager.js](#cannonmanagerjs)
			- [Evaluation](#evaluation-3)

## Files

### index.js

This holds the `Game` Class that controls the entire game control. The `Game`
class has several data members for controlling the game. It has different events
specified for the final outcome of the game, and to start and possibly pause the
game.
It has 
- several events to control game flow and determine final game state
- threeManager and cannonManager to maintain state for different libaries
- Array of medy to keep track of game object data
- array of enemies to keep track of enemy data
- animationLoop to keep track of the animation loop
- loop to call loop for the newest instance of the `Game` class

The `Game` class also keeps track of the UI styling.

#### Evaluation
The data members are clear, but the functions are unclear. The `start` function
does not 'start' the game. It calls the `initializeGame`, and `loop` functions.
The `initializeGame` functions setups the physical world and the visual scene
using the managers. It then creates the players and the enemies. Then, the loop
allows the loading game to be animated. It is unclear how much of the game
`start()` actually starts when `createUI()` needs to be called after each time.
For the `update()`, I do like each game object handling its own update. The
cannonManager and threeManager are able to handle their own physics and lighting
effects. The medies (mesh/body => custom game object) are able to handle their
own updates as well. I like their responsibility to handle their own updates.
It matches the update functions in each object in Unity. However, the separation
between medy and enemies is confusing. I do not immediately see why they are
separated. They should either be combined or any game logic using them should be
encapsulated into a function. 

The `destroy()` function is not clear. Why does it need to access different
parts of the player instance. It should only tell the game objects to clean
themselves and clear out all instances. 

Final restructing should be in the game control. Clarify the start, restart, and
initialize function to better communicate the game flow within the code. 


### KeyboardController.js
It sets up event listeners to mainstate state of which keys are being pressed. 

#### Evaluation

It is clear. It keeps track of the keys that you wanted it to do. The change
that could be made would be with the usage. Rather than instantiating it as a
part of the window, make part of the player input that is made later. This way,
we can control the player state and movement easier. 

### ThreeManager.js

Data members:
- array of all visuals
- arrays of all mixers (deprecated, game objects control their own mixer)
- threejs clock
- camera
- scene
- renderer
  This sets up the renderer and appends the DOM element to the end of the body.
  It then creates everything in the scene that is not the player or an NPC.

#### Evaluation 

There could be some better integration between the threeManager and
cannonManager. When creating the scene and the world, there is no reference
between the two. You just have to hope that you are creating the same kind of
objects. I would like to make a better converter between a threejs mesh and
cannon body to allow for a function within the `Game` class to just add the
correct bodies and meshes and lights to the scene and world. The scene handling
is unclear of when a new scene is created as well. However, the single
responsibilit for the threeManager over all the visual meshes is great and
correct bodies and meshes and lights to the scene and world. The scene handling
is unclear of when a new scene is created as well. However, the single
responsibilit for the threeManager over all the visual meshes is great and
clear. This only touches visual threejs objects as it should. The visual array
might be useful for disposal as there was some trouble with mesh disposal with
the loaded FBX from the player and enemy models.
 
### CannonManager.js

Data Members:
- timeStep to be used in `update()`
- filter IDs for different bodies 
- world 

#### Evaluation
The single responsibility for the manager is good. It only touches the body. It
is unclear when the manager creates a whole new `world` instance. The body
removal is also unclear. What does killing the body do and how does it affect
the game when the object is removed? The lack of optimization shows when the
game starts to stutter as we add more game objects. As stated in the
threeManager evaluation, it would help if there was some conversion between mesh
and body to allow for 
