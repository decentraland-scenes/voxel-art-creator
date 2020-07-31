# Voxel Art Creator

_A screenshot of the voxel art creator running in preview._

A voxel art creator based on the amazing [magicavoxel](https://ephtracy.github.io/). You can try out the scene [here](https://play.decentraland.org/?position=-149%2C-146).

![screenshot](https://github.com/decentraland-scenes/voxel-art-creator-example-scene/blob/master/screenshots/screenshot.png)

This scen shows you:

- How to use the message bus to keep players in sync with each other's actions while they're together in the scene
- How to send HTTP requests to an API to store the scene state in a permanent place, so others can then retrieve changes
- How to set up a server that is capable of handling the storage of data in a separate Amazon S3 server
- How to obtain the realm that a player is currently on
- How to use ray casting to spawn an entity at the position that the player is pointing
- How to play sounds from a file
- How to add custom UI hints that don't interfere with the interactin with the scene



## Try it out

**Install the CLI**

Download and install the Decentraland CLI by running the following command:

```bash
npm i -g decentraland
```

**Previewing the scene**

Download this example and navigate to its directory, then run:

```
$:  dcl start
```

Any dependencies are installed and then the CLI opens the scene in a new browser tab.

**Setting up the server**

The scene is set up to make use of the same server that's used by Soho Plaza. To launch your own server, we recommend you deploy what's in the `/server` folder to your own Firebase account, following the steps in [this tutorial](https://decentraland.org/blog/tutorials/servers-part-2/). To store data on an Amazon S3 server, as done here, you'll also need to set up your own Amazon S3, and fetch credentials for that account to include in your server folder.


## Controls

* Left mouse click to add / remove / eye drop a voxel
* Use 'E' to toggle between add / remove / eye drop mode
* Use 'F' to change colors

## Future Improvements

* Undo / Reset / Clear button
* Color palette to choose and store colors
* Help menu with instructions
* More tools such as Ellipse / Rectangle / Line
* Shared experience
* Many more...

## About syncing changes between players

When a player comes into the scene they download the latest data about existing voxels from off the server. Then, as different players that are there add and remove voxels, they get these changes from each other using the Message Bus, they don’t need to check the server regularly to know what’s new.

For this to work properly, we need to keep a separate version of this pattern for each realm and know what realm each player is on when they update the pattern. This is because only players that are in the same realm message each other via the Message Bus. There would otherwise be odd inconsistencies in what ends up being stored when players that are in different realms modify the same scene without notifying each other. The scene includes the player’s realm as part of the requests it sends, and the server then handles a different .json file depending on the realm.

Note: This works fine as long as the scene is deployed in one single place in the map. If various copies of the same scene exist and call the same server, writing to the same database, then that could be a problem. If two players are interacting with the two different versions of the scene, they will be acting upon the same database, but they won't share changes via the message bus. This will result in inconsistencies in between what each one sees and the final result being stored.


Learn more about how to build your own scenes in our [documentation](https://docs.decentraland.org/) site.

If something doesn’t work, please [file an issue](https://github.com/decentraland-scenes/Awesome-Repository/issues/new).

## Copyright info

This scene is protected with a standard Apache 2 licence. See the terms and conditions in the [LICENSE](/LICENSE) file.

## Acknowledgements

* _eyeIcon.png_ modified from https://material.io/resources/icons/?icon=remove_red_eye&style=baseline
* _eyeDropVoxel.mp3_ modified from https://freesound.org/people/Adam_N/sounds/166325/
